from __future__ import annotations
import os
from functools import lru_cache
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()


class ServiceNowSettings(BaseModel):
    instance_url: str = ""
    username: str = ""
    password: str = ""
    verify_ssl: bool = True


class Settings(BaseModel):
    mock_servicenow: bool = True
    http_timeout_seconds: int = 10
    servicenow: ServiceNowSettings = ServiceNowSettings()


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = _load()
    return _settings


def reload_settings() -> None:
    global _settings
    _settings = _load()


def _load() -> Settings:
    snow = ServiceNowSettings(
        instance_url=os.getenv("SERVICENOW_INSTANCE_URL", ""),
        username=os.getenv("SERVICENOW_USERNAME", ""),
        password=os.getenv("SERVICENOW_PASSWORD", ""),
        verify_ssl=os.getenv("SERVICENOW_VERIFY_SSL", "true").lower() != "false",
    )
    # Auto-detect mock mode: if no instance URL provided, use mock
    use_mock = os.getenv("MOCK_SERVICENOW", "").lower()
    if use_mock == "false" and snow.instance_url:
        mock = False
    else:
        mock = True

    return Settings(
        mock_servicenow=mock,
        http_timeout_seconds=int(os.getenv("HTTP_TIMEOUT_SECONDS", "10")),
        servicenow=snow,
    )
