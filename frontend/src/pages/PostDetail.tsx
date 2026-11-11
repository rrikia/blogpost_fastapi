
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, type Comment, type PostWithVotes } from '../api'
import { useAuth } from '../auth'
import VoteButton from '../components/VoteButton'
import { formatDate } from '../format'

export default function PostDetail() {
  const id = Number(useParams().id)
  const { userId } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState<PostWithVotes | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getPost(id), api.getComments(id)])
      .then(([post, comments]) => {
        setData(post)
        setComments(comments)
      })
      .catch((err) => setError(err.message))
  }, [id])

  async function handleDeletePost() {
    if (!confirm('Delete this post?')) return
    await api.deletePost(id)
    navigate('/')
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()

    try {
      const comment = await api.addComment(id, newComment)
      setComments((c) => [...c, comment])
      setNewComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add comment')
    }
  }

  async function handleDeleteComment(commentId: number) {
    await api.deleteComment(commentId)
    setComments((c) => c.filter((x) => x.id !== commentId))
  }

  if (error) return <p className="error">{error}</p>

  if (!data) {
    return <p className="text-sm text-light">Loading post...</p>
  }

  const post = data.Post
  const isOwner = post.owner_id === userId

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="text-sm text-light transition-colors hover:text-cream"
      >
        ← All posts
      </Link>

      <article className="card flex gap-4">
        <VoteButton postId={post.id} votes={data.votes} />

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-cream">
            {post.title}
          </h1>

          <p className="mt-1 text-xs text-light">
            {post.owner.email} · {formatDate(post.created_at)}
          </p>

          <p className="mt-4 whitespace-pre-wrap text-cream/90 leading-relaxed">
            {post.content}
          </p>

          {isOwner && (
            <div className="mt-4 flex gap-2">
              <Link
                to={`/posts/${post.id}/edit`}
                className="btn-secondary"
              >
                Edit
              </Link>

              <button
                onClick={handleDeletePost}
                className="rounded-md border border-red-300/30 bg-red-950/40 px-3 py-1.5 text-sm font-medium text-red-200 transition-colors hover:bg-red-900/60"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </article>

      <section>
        <h2 className="mb-3 font-semibold text-cream">
          Comments ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p className="mb-3 text-sm text-light">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="card py-3">
                <p className="whitespace-pre-wrap text-sm text-cream/90">
                  {c.content}
                </p>

                <div className="mt-2 flex items-center justify-between text-xs text-light">
                  <span>
                    {c.owner.email} · {formatDate(c.created_at)}
                  </span>

                  {c.owner_id === userId && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-red-200 transition-colors hover:text-red-100 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddComment} className="mt-4 space-y-2">
          <textarea
            className="input min-h-20"
            placeholder="Write a comment..."
            required
            maxLength={2000}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <button className="btn-primary">
            Comment
          </button>
        </form>
      </section>
    </div>
  )
}
