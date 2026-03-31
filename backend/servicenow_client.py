from __future__ import annotations
import itertools
from typing import Optional
import requests
from requests.auth import HTTPBasicAuth

from config import get_settings
from logger_config import get_logger
from models import IncidentResult, TicketFields

logger = get_logger(__name__)
_mock_incident_counter = itertools.count(start=10001)

ALLOWED_CATEGORIES = {"network", "identity", "service_desk", "hardware", "software"}


class ServiceNowClient:
    def __init__(self) -> None:
        self._session = requests.Session()

    def get_last_ticket(self, employee_id: str) -> Optional[dict]:
        settings = get_settings()

        if settings.mock_servicenow:
            return {"number": "INC0012345", "state": "In Progress"}

        url = (
            f"{settings.servicenow.instance_url.rstrip('/')}/api/now/table/incident"
            f"?sysparm_query=opened_by={employee_id}^ORDERBYDESCopened_at&sysparm_limit=1"
        )
        response = self._session.get(
            url,
            auth=HTTPBasicAuth(settings.servicenow.username, settings.servicenow.password),
            headers={"Accept": "application/json"},
            timeout=settings.http_timeout_seconds,
            verify=settings.servicenow.verify_ssl,
        )
        response.raise_for_status()
        results = response.json().get("result", [])
        return results[0] if results else None

    def sanitize_ticket_fields(self, ticket_fields: TicketFields) -> TicketFields:
        category = ticket_fields.category if ticket_fields.category in ALLOWED_CATEGORIES else "service_desk"
        subcategory = (ticket_fields.subcategory or "other").strip()[:80] or "other"
        short_description = (ticket_fields.short_description or "User support request").strip()[:160]
        description = (ticket_fields.description or "No description provided.").strip()[:4000]

        impact = int(ticket_fields.impact)
        urgency = int(ticket_fields.urgency)

        if impact not in {1, 2, 3}:
            impact = 2
        if urgency not in {1, 2, 3}:
            urgency = 2

        return TicketFields(
            short_description=short_description,
            description=description,
            category=category,
            subcategory=subcategory,
            impact=impact,
            urgency=urgency,
        )

    def create_incident(self, ticket_fields: TicketFields) -> IncidentResult:
        settings = get_settings()
        sanitized = self.sanitize_ticket_fields(ticket_fields)

        logger.info(
            "Creating ServiceNow incident",
            extra={"extra_data": {
                "category": sanitized.category,
                "subcategory": sanitized.subcategory,
                "mock_mode": settings.mock_servicenow,
            }},
        )

        if settings.mock_servicenow:
            mock_number = f"INC{next(_mock_incident_counter):07d}"
            mock_sys_id = f"mock-sys-id-{mock_number.lower()}"
            logger.info(
                "Mock ServiceNow incident created",
                extra={"extra_data": {
                    "incident_number": mock_number,
                    "sys_id": mock_sys_id,
                    "category": sanitized.category,
                    "subcategory": sanitized.subcategory,
                }},
            )
            return IncidentResult(
                success=True,
                incident_number=mock_number,
                sys_id=mock_sys_id,
                fields_used=sanitized,
                notes="Mock ServiceNow incident created successfully.",
            )

        url = f"{settings.servicenow.instance_url.rstrip('/')}/api/now/table/incident"
        body = {
            "short_description": sanitized.short_description,
            "description":       sanitized.description,
            "category":          sanitized.category,
            "subcategory":       sanitized.subcategory,
            "urgency":           str(sanitized.urgency),
            "impact":            str(sanitized.impact),
        }
        response = self._session.post(
            url,
            auth=HTTPBasicAuth(settings.servicenow.username, settings.servicenow.password),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            json=body,
            timeout=settings.http_timeout_seconds,
            verify=settings.servicenow.verify_ssl,
        )
        response.raise_for_status()
        result = response.json().get("result", {})
        incident_number = result.get("number")
        sys_id = result.get("sys_id")

        logger.info(
            "ServiceNow incident created successfully",
            extra={"extra_data": {
                "incident_number": incident_number,
                "sys_id": sys_id,
                "category": sanitized.category,
                "subcategory": sanitized.subcategory,
            }},
        )
        return IncidentResult(
            success=True,
            incident_number=incident_number,
            sys_id=sys_id,
            fields_used=sanitized,
            notes="Incident created successfully in ServiceNow.",
        )

    def fetch_incident(self, incident_number: str) -> IncidentResult:
        settings = get_settings()

        logger.info(
            "Fetching ServiceNow incident",
            extra={"extra_data": {
                "incident_number": incident_number,
                "mock_mode": settings.mock_servicenow,
            }},
        )

        if settings.mock_servicenow:
            return IncidentResult(
                success=True,
                incident_number=incident_number,
                sys_id=f"mock-sys-id-{incident_number.lower()}",
                fields_used=None,
                notes="Mock ServiceNow fetch completed successfully.",
            )

        url = (
            f"{settings.servicenow.instance_url.rstrip('/')}/api/now/table/incident"
            f"?sysparm_query=number={incident_number}&sysparm_limit=1"
        )
        response = self._session.get(
            url,
            auth=HTTPBasicAuth(settings.servicenow.username, settings.servicenow.password),
            headers={"Accept": "application/json"},
            timeout=settings.http_timeout_seconds,
            verify=settings.servicenow.verify_ssl,
        )
        response.raise_for_status()
        results = response.json().get("result", [])

        if not results:
            return IncidentResult(
                success=False,
                incident_number=incident_number,
                sys_id=None,
                fields_used=None,
                notes=f"No incident found for {incident_number}.",
            )

        result = results[0]
        return IncidentResult(
            success=True,
            incident_number=result.get("number"),
            sys_id=result.get("sys_id"),
            fields_used=None,
            notes="Incident fetched successfully from ServiceNow.",
        )
