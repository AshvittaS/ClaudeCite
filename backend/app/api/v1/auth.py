from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Workspace, WorkspaceMember, UserSettings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.errors import AppError
from app.schemas.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: UserRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise AppError("EMAIL_EXISTS", "An account with this email already exists.", 400)

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name or body.email.split("@")[0],
    )
    db.add(user)
    db.flush()

    # Auto-create default workspace
    ws = Workspace(
        name=f"{user.display_name}'s Workspace",
        owner_user_id=user.id,
        workspace_type="personal",
    )
    db.add(ws)
    db.flush()

    membership = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role="owner")
    db.add(membership)

    user_settings = UserSettings(user_id=user.id)
    db.add(user_settings)

    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(body: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash or ""):
        raise AppError("INVALID_CREDENTIALS", "Invalid email or password.", 401)
    if not user.is_active:
        raise AppError("ACCOUNT_DISABLED", "This account is disabled.", 403)

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token)


@router.post("/token", response_model=TokenResponse)
def login_form(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible endpoint for token."""
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash or ""):
        raise AppError("INVALID_CREDENTIALS", "Invalid credentials.", 401)
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token)
