from pydantic import BaseModel
from typing import List, Optional

class SaleRecord(BaseModel):
    productId: str
    productName: str
    qty: float
    month: int
    year: int
    currentStock: float = 0
    # historicalStock = stock AT THAT TIME (for real training)
    # If not provided, currentStock is used as a proxy
    historicalStock: Optional[float] = None
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
    # tells frontend whether real or synthetic model was used
    modelType: str = "synthetic"