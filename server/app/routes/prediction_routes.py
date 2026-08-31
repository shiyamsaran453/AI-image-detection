from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.dependencies.auth_dependency import get_current_user
from app.services.prediction_service import (
    run_model_prediction,
    save_prediction_to_db,
    save_uploaded_file,
)

router = APIRouter(prefix="/api", tags=["Prediction"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post("/predict", status_code=status.HTTP_200_OK)
def predict_image_route(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    try:
        if file is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file is required",
            )

        if not file.content_type or file.content_type.lower() not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPG, JPEG, PNG, and WEBP image files are allowed",
            )

        file_path = save_uploaded_file(file)
        prediction = run_model_prediction(file_path)

        prediction_id = save_prediction_to_db(
            user_id=current_user["user_id"],
            image_path=file_path,
            label=prediction["label"],
            confidence=prediction["confidence"],
        )

        return {
            "message": "Prediction completed successfully",
            "prediction_id": prediction_id,
            "result": {
                "label": prediction["label"],
                "confidence": prediction["confidence"],
                "image_path": file_path,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )