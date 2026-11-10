from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, oauth2, schemas
from ..database import get_db

router = APIRouter(tags=["Comments"])


def get_post_or_404(db: Session, post_id: int) -> models.Post:
    post = db.get(models.Post, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"post with id: {post_id} was not found",
        )
    return post


@router.get("/posts/{post_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(
    post_id: int,
    limit: int = 20,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    get_post_or_404(db, post_id)
    comments = db.scalars(
        select(models.Comment)
        .where(models.Comment.post_id == post_id)
        .order_by(models.Comment.created_at, models.Comment.id)
        .limit(limit)
        .offset(skip)
    ).all()
    return comments


@router.post(
    "/posts/{post_id}/comments",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.CommentOut,
)
def create_comment(
    post_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    get_post_or_404(db, post_id)
    new_comment = models.Comment(
        post_id=post_id, owner_id=current_user.id, **comment.model_dump()
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_user),
):
    comment = db.get(models.Comment, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"comment with id: {comment_id} does not exist",
        )
    if comment.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform requested action",
        )
    db.delete(comment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
