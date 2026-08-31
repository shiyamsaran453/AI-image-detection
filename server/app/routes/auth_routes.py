from fastapi import APIRouter, HTTPException, status

from app.schemas.auth_schema import LoginSchema, RegisterSchema
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterSchema):
    try:
        user, error = register_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )

        if error:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE if "Database" in error else status.HTTP_400_BAD_REQUEST
            raise HTTPException(status_code=status_code, detail=error)

        return {
            "message": "User registered successfully",
            "user": user,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/login", status_code=status.HTTP_200_OK)
def login(payload: LoginSchema):
    try:
        result, error = login_user(
            email=payload.email,
            password=payload.password,
        )

        if error:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE if "Database" in error else status.HTTP_401_UNAUTHORIZED
            raise HTTPException(status_code=status_code, detail=error)

        return {
            "message": "Login successful",
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "user": result["user"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )