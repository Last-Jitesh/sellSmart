import numpy as np
from sklearn.tree import DecisionTreeClassifier

LABEL_MAP = {0: "Stock Less", 1: "Stock Same", 2: "Stock More"}

# ── Synthetic fallback data (used when real data is insufficient) ─────────────
def _build_synthetic_data():
    """
    600 synthetic samples based on business heuristics.
    Used as fallback when a shop has < 3 months of real data.
    ratio = predicted / max(current_stock, 1)
    - Stock More  → ratio > 1.3
    - Stock Same  → 0.7 ≤ ratio ≤ 1.3
    - Stock Less  → ratio < 0.7
    """
    rng = np.random.RandomState(42)
    n = 600
    predicted = rng.uniform(0, 300, n)
    stock     = rng.uniform(0, 300, n)
    ratio     = predicted / np.maximum(stock, 1)

    labels = []
    for r in ratio:
        if r > 1.3:
            labels.append(2)
        elif r >= 0.7:
            labels.append(1)
        else:
            labels.append(0)

    X = np.column_stack([predicted, stock, ratio])
    y = np.array(labels)
    return X, y


# ── Pre-train on synthetic data as the global fallback ───────────────────────
_X_syn, _y_syn = _build_synthetic_data()
_fallback_clf = DecisionTreeClassifier(max_depth=5, random_state=42)
_fallback_clf.fit(_X_syn, _y_syn)


# ── Real-data training ────────────────────────────────────────────────────────
def train_on_real_data(product_monthly_data: dict) -> DecisionTreeClassifier | None:
    """
    product_monthly_data: {
        productId: [
            {"month": 1, "year": 2025, "qty": 50, "stock": 30},
            ...
        ]
    }

    For each product we create training samples:
      Features: [qty_sold, stock_at_time, ratio]
      Label:    derived from ratio (same heuristic as synthetic)

    Returns a trained classifier if enough data exists, else None.
    """
    X_rows, y_rows = [], []

    for pid, records in product_monthly_data.items():
        # Need at least 3 months per product to be meaningful
        if len(records) < 3:
            continue

        for r in records:
            qty   = float(r.get("qty", 0))
            stock = float(r.get("stock", 0))
            ratio = qty / max(stock, 1)

            # Derive label from ratio (same rule as synthetic)
            if ratio > 1.3:
                label = 2   # Stock More
            elif ratio >= 0.7:
                label = 1   # Stock Same
            else:
                label = 0   # Stock Less

            X_rows.append([qty, stock, ratio])
            y_rows.append(label)

    if len(X_rows) < 10:
        # Not enough real samples — fallback
        return None

    X = np.array(X_rows)
    y = np.array(y_rows)

    # Make sure all 3 classes are represented; if not, pad with synthetic
    unique = set(y)
    if len(unique) < 3:
        # Add a small number of synthetic samples to cover missing classes
        X = np.vstack([X, _X_syn[:60]])
        y = np.concatenate([y, _y_syn[:60]])

    clf = DecisionTreeClassifier(max_depth=5, random_state=42)
    clf.fit(X, y)
    return clf


def classify_restock(
    predicted_qty: float,
    current_stock: float,
    clf: DecisionTreeClassifier | None = None
) -> str:
    """
    Given predicted demand and current stock, returns restock recommendation.
    Uses real-data classifier if provided, else global fallback.
    """
    model = clf if clf is not None else _fallback_clf
    ratio = predicted_qty / max(current_stock, 1)
    X = np.array([[predicted_qty, current_stock, ratio]])
    label_int = int(model.predict(X)[0])
    return LABEL_MAP.get(label_int, "Stock Same")