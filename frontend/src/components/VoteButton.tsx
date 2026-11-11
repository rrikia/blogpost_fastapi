
import { useState } from 'react'
import { api, ApiError } from '../api'

// The API has no "did I already vote?" endpoint, so this toggles:
// try to add a vote; if the API says 409 (already voted), remove it instead.
export default function VoteButton({
  postId,
  votes,
}: {
  postId: number
  votes: number
}) {
  const [count, setCount] = useState(votes)
  const [voted, setVoted] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)

    try {
      if (voted) {
        await api.vote(postId, 0)
        setCount((c) => c - 1)
        setVoted(false)
      } else {
        try {
          await api.vote(postId, 1)
          setCount((c) => c + 1)
          setVoted(true)
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            await api.vote(postId, 0)
            setCount((c) => c - 1)
            setVoted(false)
          } else {
            throw err
          }
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Vote failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={voted ? 'Remove vote' : 'Vote'}
      aria-pressed={voted === true}
      className={`flex min-w-12 self-start flex-col items-center
        rounded-md border px-2 py-1 text-sm font-semibold
        transition-colors duration-200
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-cream focus-visible:ring-offset-2
        focus-visible:ring-offset-dark
        disabled:cursor-not-allowed disabled:opacity-50
        ${
          voted
            ? 'border-cream bg-cream text-dark hover:bg-light hover:border-light'
            : 'border-light/40 bg-blue text-cream hover:bg-light hover:text-dark hover:border-light'
        }`}
    >
      <span aria-hidden="true">▲</span>
      <span>{count}</span>
    </button>
  )
}
