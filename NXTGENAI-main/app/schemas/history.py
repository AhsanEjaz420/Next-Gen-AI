from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any, Dict, List, Optional

class HistoryResponse(BaseModel):
    id: int
    tool_name: str
    input_data: Dict[str, Any]
    output_content: str
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True

class RefineRequest(BaseModel):
    instruction: str = Field(..., example="Make this shorter and more professional.")
