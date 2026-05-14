from fastapi import HTTPException, status


class BackendError(Exception):
    """Base error for expected backend failures."""


class ProviderConfigurationError(BackendError):
    """Raised when a provider is selected but not configured."""


class ProviderRuntimeError(BackendError):
    """Raised when a provider call fails."""


class PersonaNotFoundError(BackendError):
    """Raised when a requested persona is missing."""


def to_http_exception(error: Exception) -> HTTPException:
    if isinstance(error, PersonaNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, ProviderConfigurationError):
        return HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error))
    if isinstance(error, ProviderRuntimeError):
        return HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(error))
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected backend error")
