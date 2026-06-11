from fastapi import APIRouter
from schemas.request import PredictRequest, ProductPrediction
from models.linear_regression import predict_next_month
from models.decision_tree import classify_restock
from collections import defaultdict
from typing import List

router = APIRouter()

@router.post("/predict", response_model=List[ProductPrediction])
def predict(payload: PredictRequest):
    """
    Pipeline:
    1. Group historical records by productId
    2. Run Linear Regression per product → predicted qty for next month
    3. Run Decision Tree → Stock More / Stock Same / Stock Less
    4. Return sorted by qty sold this month (descending)
    """
    records = payload.records

    # Group all monthly records by product
    by_product: dict[str, list] = defaultdict(list)
    meta: dict[str, dict] = {}

    now_records: dict[str, float] = {}  # most recent month qty

    for r in records:
        pid = r.productId
        by_product[pid].append({
            "month": r.month,
            "year":  r.year,
            "qty":   r.qty,
        })
        # Store metadata (name, category, stock) — will be overwritten each loop but that's fine
        meta[pid] = {
            "productName":  r.productName,
            "category":     r.category,
            "currentStock": r.currentStock,
        }

    if not by_product:
        return []

    # Find the latest month across all records
    all_months = [(r.year, r.month) for r in records]
    latest_year, latest_month = max(all_months)

    # For each product, find qty in the latest month
    for pid, month_data in by_product.items():
        latest = [d for d in month_data if d["year"] == latest_year and d["month"] == latest_month]
        now_records[pid] = latest[0]["qty"] if latest else 0.0

    results = []
    for pid, month_data in by_product.items():
        predicted_qty  = predict_next_month(month_data)
        current_stock  = meta[pid]["currentStock"]
        recommendation = classify_restock(predicted_qty, current_stock)

        results.append(ProductPrediction(
            productId=pid,
            productName=meta[pid]["productName"],
            category=meta[pid]["category"],
            qtySoldThisMonth=now_records.get(pid, 0.0),
            predictedQty=predicted_qty,
            currentStock=current_stock,
            recommendation=recommendation,
        ))

    # Sort by qty sold this month descending
    results.sort(key=lambda x: x.qtySoldThisMonth, reverse=True)
    return results
