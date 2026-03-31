from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class TicketFields(BaseModel):
    short_description: str
    description: str
    category: str
    subcategory: str
    impact: int = 2
    urgency: int = 2


class IncidentResult(BaseModel):
    success: bool
    incident_number: Optional[str] = None
    sys_id: Optional[str] = None
    fields_used: Optional[TicketFields] = None
    notes: str = ""
