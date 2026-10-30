from fastapi import HTTPException, status


class AppError(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = 400):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message},
        )


class NotFoundError(AppError):
    def __init__(self, resource: str = "Resource"):
        super().__init__("NOT_FOUND", f"{resource} not found.", 404)


class ForbiddenError(AppError):
    def __init__(self):
        super().__init__("FORBIDDEN", "Access denied.", 403)


class UnauthorizedError(AppError):
    def __init__(self):
        super().__init__("UNAUTHORIZED", "Authentication required.", 401)


class DocumentNotReadyError(AppError):
    def __init__(self):
        super().__init__("DOCUMENT_NOT_READY", "The document has not finished processing.", 400)


class FileTooLargeError(AppError):
    def __init__(self, max_mb: int):
        super().__init__("FILE_TOO_LARGE", f"File exceeds the {max_mb}MB limit.", 413)


class UnsupportedFileTypeError(AppError):
    def __init__(self):
        super().__init__("UNSUPPORTED_FILE_TYPE", "Unsupported file format. Use PDF, DOCX, XLSX, or TXT.", 415)
