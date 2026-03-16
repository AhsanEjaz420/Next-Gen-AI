from pydantic import BaseModel
from typing import List, Any, Optional

class BatchItemResult(BaseModel):
    status: str
    identifier: str  # product_name or topic
    data: Optional[Any] = None
    error: Optional[str] = None

class BatchResponse(BaseModel):
    success: bool
    results: List[BatchItemResult]
