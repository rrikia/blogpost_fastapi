
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, type PostWithVotes } from '../api'
import VoteButton from '../components/VoteButton'
import { formatDate } from '../format'

const PAGE_SIZE = 10

export default function Feed() {
  const [posts, setPosts] = useState<PostWithVotes[]>([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .getPosts(query, PAGE_SIZE, page * PAGE_SIZE)
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [query, page])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setPage(0)
          setQuery(search)
        }}
        className="mb-6 flex gap-2"
      >
        <input
          className="input"
          placeholder="Search post titles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-secondary">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <p className="text-sm text-light">Loading posts...</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="card text-center text-light">
          No posts yet.{' '}
          <Link
            to="/posts/new"
            className="font-medium text-cream underline hover:text-white"
          >
            Write the first one
          </Link>
          .
        </div>
      )}

      <ul className="space-y-3">
        {posts.map(({ Post: post, votes }) => (
          <li
            key={post.id}
            className="card flex gap-4 transition-colors hover:border-light/60"
          >
            <VoteButton postId={post.id} votes={votes} />

            <div className="min-w-0 flex-1">
              <Link
                to={`/posts/${post.id}`}
                className="font-semibold text-cream transition-colors hover:text-white hover:underline"
              >
                {post.title}
              </Link>

              <p className="mt-1 line-clamp-2 text-sm text-cream/85">
                {post.content}
              </p>

              <p className="mt-2 text-xs text-light">
                {post.owner.email} · {formatDate(post.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {!loading && (page > 0 || posts.length === PAGE_SIZE) && (
        <div className="mt-6 flex justify-between">
          <button
            className="btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>

          <button
            className="btn-secondary"
            disabled={posts.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
