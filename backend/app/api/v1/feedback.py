from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Feedback, User
from app.schemas.schemas import FeedbackCreate
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    feedback = Feedback(
        user_id=user.id,
        category=payload.category,
        message=payload.message,
    )
    db.add(feedback)
    db.commit()
    return {"status": "received", "message": "Thank you for your feedback!"}
