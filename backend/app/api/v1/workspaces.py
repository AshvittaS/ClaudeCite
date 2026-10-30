import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Workspace, WorkspaceMember, User
from app.schemas.schemas import WorkspaceCreate, WorkspaceOut
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=list[WorkspaceOut])
def list_workspaces(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Workspaces user owns or is a member of
    memberships = db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user.id).all()
    ws_ids = [m.workspace_id for m in memberships]
    owned = db.query(Workspace).filter(Workspace.owner_user_id == user.id).all()
    all_ws_ids = set(ws_ids + [w.id for w in owned])

    workspaces = db.query(Workspace).filter(Workspace.id.in_(all_ws_ids)).all()
    return workspaces


@router.post("", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
def create_workspace(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ws_id = str(uuid.uuid4())
    new_ws = Workspace(
        id=ws_id,
        name=payload.name,
        owner_user_id=user.id,
        workspace_type=payload.workspace_type or "team",
    )
    db.add(new_ws)

    member = WorkspaceMember(
        workspace_id=ws_id,
        user_id=user.id,
        role="owner",
    )
    db.add(member)

    db.commit()
    db.refresh(new_ws)
    return new_ws


@router.get("/{workspace_id}", response_model=WorkspaceOut)
def get_workspace(
    workspace_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws
