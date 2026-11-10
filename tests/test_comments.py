import pytest
from app import models, schemas


@pytest.fixture
def test_comments(test_posts, test_user, test_user2, session):
    comments = [
        models.Comment(content="first comment", post_id=test_posts[0].id, owner_id=test_user["id"]),
        models.Comment(content="second comment", post_id=test_posts[0].id, owner_id=test_user2["id"]),
        models.Comment(content="other post", post_id=test_posts[1].id, owner_id=test_user["id"]),
    ]
    session.add_all(comments)
    session.commit()
    return session.query(models.Comment).order_by(models.Comment.id).all()


def test_get_comments_for_post(authorized_client, test_posts, test_comments):
    res = authorized_client.get(f"/posts/{test_posts[0].id}/comments")
    assert res.status_code == 200
    comments = [schemas.CommentOut(**c) for c in res.json()]
    assert len(comments) == 2
    assert [c.content for c in comments] == ["first comment", "second comment"]


def test_unauthorized_get_comments(client, test_posts, test_comments):
    res = client.get(f"/posts/{test_posts[0].id}/comments")
    assert res.status_code == 401


def test_get_comments_post_not_found(authorized_client, test_posts):
    res = authorized_client.get("/posts/88888/comments")
    assert res.status_code == 404


def test_create_comment(authorized_client, test_user, test_posts):
    post_id = test_posts[3].id
    res = authorized_client.post(f"/posts/{post_id}/comments", json={"content": "nice post"})
    assert res.status_code == 201
    comment = schemas.CommentOut(**res.json())
    assert comment.content == "nice post"
    assert comment.post_id == post_id
    assert comment.owner_id == test_user["id"]
    assert comment.owner.email == test_user["email"]


def test_create_comment_empty_content(authorized_client, test_posts):
    res = authorized_client.post(
        f"/posts/{test_posts[0].id}/comments", json={"content": ""})
    assert res.status_code == 422


def test_create_comment_post_not_found(authorized_client, test_posts):
    res = authorized_client.post("/posts/88888/comments", json={"content": "hi"})
    assert res.status_code == 404


def test_unauthorized_create_comment(client, test_posts):
    res = client.post(f"/posts/{test_posts[0].id}/comments", json={"content": "hi"})
    assert res.status_code == 401


def test_delete_own_comment(authorized_client, test_comments):
    res = authorized_client.delete(f"/comments/{test_comments[0].id}")
    assert res.status_code == 204


def test_delete_other_users_comment(authorized_client, test_comments):
    # test_comments[1] belongs to test_user2
    res = authorized_client.delete(f"/comments/{test_comments[1].id}")
    assert res.status_code == 403


def test_delete_comment_not_found(authorized_client, test_comments):
    res = authorized_client.delete("/comments/88888")
    assert res.status_code == 404


def test_comments_deleted_with_post(authorized_client, test_posts, test_comments, session):
    post_id = test_posts[0].id
    res = authorized_client.delete(f"/posts/{post_id}")
    assert res.status_code == 204
    remaining = session.query(models.Comment).filter(
        models.Comment.post_id == post_id).count()
    assert remaining == 0
