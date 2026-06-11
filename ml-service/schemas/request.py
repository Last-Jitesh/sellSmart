from pydantic import BaseModel
from typing import List, Optional

class SaleRecord(BaseModel):
    productId: str
    productName: str
    qty: float
    month: int
    year: int
    currentStock: float = 0
    category: str = "General"

class PredictRequest(BaseModel):
    records: List[SaleRecord]

class ProductPrediction(BaseModel):
    productId: str
    productName: str
    category: str
    qtySoldThisMonth: float
    predictedQty: float
    currentStock: float
    recommendation: str
