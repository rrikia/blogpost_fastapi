
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { api } from '../api'

// Used for both /posts/new and /posts/:id/edit
export default function PostForm() {
  const { id } = useParams()
  const editing = id !== undefined
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) return

    api
      .getPost(Number(id))
      .then(({ Post }) => {
        setTitle(Post.title)
        setContent(Post.content)
      })
      .catch((err) => setError(err.message))
  }, [editing, id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const data = { title, content, published: true }
      const post = editing
        ? await api.updatePost(Number(id), data)
        : await api.createPost(data)

      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-cream">
        {editing ? 'Edit post' : 'New post'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-cream">
            Post title
          </label>

          <input
            className="input"
            placeholder="Enter your post title..."
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-cream">
            Content
          </label>

          <textarea
            className="input min-h-48"
            placeholder="Share something today..."
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <div className="flex gap-2">
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
