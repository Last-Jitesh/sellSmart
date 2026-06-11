import numpy as np
from sklearn.tree import DecisionTreeClassifier

# ── Pre-train the Decision Tree on heuristic rules ──────────────────────────
# Features: [predicted_qty, current_stock, ratio]
# Labels: 0=Stock Less, 1=Stock Same, 2=Stock More

def _build_training_data():
    """
    Generate synthetic training data based on business rules:
    - ratio = predicted / max(current_stock, 1)
    - Stock More  → ratio > 1.3  (demand significantly exceeds stock)
    - Stock Same  → 0.7 ≤ ratio ≤ 1.3
    - Stock Less  → ratio < 0.7  (demand much lower than stock)
    """
    rng = np.random.RandomState(42)
    n = 600
    predicted = rng.uniform(0, 300, n)
    stock     = rng.uniform(0, 300, n)
    ratio     = predicted / np.maximum(stock, 1)

    labels = []
    for r in ratio:
        if r > 1.3:
            labels.append(2)   # Stock More
        elif r >= 0.7:
            labels.append(1)   # Stock Same
        else:
            labels.append(0)   # Stock Less

    X = np.column_stack([predicted, stock, ratio])
    y = np.array(labels)
    return X, y

_X_train, _y_train = _build_training_data()
_clf = DecisionTreeClassifier(max_depth=5, random_state=42)
_clf.fit(_X_train, _y_train)

LABEL_MAP = {0: "Stock Less", 1: "Stock Same", 2: "Stock More"}


def classify_restock(predicted_qty: float, current_stock: float) -> str:
    """
    Given predicted demand and current stock, returns restock recommendation.
    """
    ratio = predicted_qty / max(current_stock, 1)
    X = np.array([[predicted_qty, current_stock, ratio]])
    label_int = int(_clf.predict(X)[0])
    return LABEL_MAP.get(label_int, "Stock Same")
