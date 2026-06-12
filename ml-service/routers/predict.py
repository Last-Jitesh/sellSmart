from fastapi import APIRouter
from schemas.request import PredictRequest, ProductPrediction
from models.linear_regression import predict_next_month
from models.decision_tree import classify_restock, train_on_real_data
from collections import defaultdict
from typing import List

router = APIRouter()

MIN_MONTHS_FOR_REAL_TRAINING = 3

@router.post("/predict", response_model=List[ProductPrediction])
def predict(payload: PredictRequest):
    """
    Pipeline:
    1. Group historical records by productId
    2. Check if shop has >= 3 months of data → train Decision Tree on real data
       Otherwise → use synthetic fallback model
    3. Run Linear Regression per product → predicted qty for next month
    4. Run Decision Tree → Stock More / Stock Same / Stock Less
    5. Return sorted by qty sold this month (descending)
    """
    records = payload.records

    # ── Group records by product ──────────────────────────────────────────────
    by_product: dict[str, list] = defaultdict(list)
    meta: dict[str, dict] = {}
    now_records: dict[str, float] = {}

    for r in records:
        pid = r.productId
        by_product[pid].append({
            "month": r.month,
            "year":  r.year,
            "qty":   r.qty,
            # use historicalStock if provided, else currentStock as proxy
            "stock": r.historicalStock if r.historicalStock is not None else r.currentStock,
        })
        meta[pid] = {
            "productName":  r.productName,
            "category":     r.category,
            "currentStock": r.currentStock,
        }

    if not by_product:
        return []

    # ── Find latest month ─────────────────────────────────────────────────────
    all_months = [(r.year, r.month) for r in records]
    latest_year, latest_month = max(all_months)

    for pid, month_data in by_product.items():
        latest = [d for d in month_data if d["year"] == latest_year and d["month"] == latest_month]
        now_records[pid] = latest[0]["qty"] if latest else 0.0

    # ── Decide: real model or synthetic fallback ──────────────────────────────
    # Count distinct months across ALL products for this shop
    distinct_months = len(set((r.year, r.month) for r in records))
    use_real = distinct_months >= MIN_MONTHS_FOR_REAL_TRAINING

    real_clf = None
    model_type = "synthetic"

    if use_real:
        real_clf = train_on_real_data(by_product)
        if real_clf is not None:
            model_type = "real"
        # If train_on_real_data returned None (not enough samples),
        # classify_restock will automatically use the fallback

    # ── Predict per product ───────────────────────────────────────────────────
    results = []
    for pid, month_data in by_product.items():
        predicted_qty  = predict_next_month(month_data)
        current_stock  = meta[pid]["currentStock"]
        recommendation = classify_restock(predicted_qty, current_stock, real_clf)

        results.append(ProductPrediction(
            productId=pid,
            productName=meta[pid]["productName"],
            category=meta[pid]["category"],
            qtySoldThisMonth=now_records.get(pid, 0.0),
            predictedQty=predicted_qty,
            currentStock=current_stock,
            recommendation=recommendation,
            modelType=model_type,
        ))

    results.sort(key=lambda x: x.qtySoldThisMonth, reverse=True)
    return results