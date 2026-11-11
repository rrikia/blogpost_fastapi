
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router'
import { onSlowRequest } from '../api'
import { useAuth } from '../auth'

export default function Layout() {
  const { userId, logout } = useAuth()
  const navigate = useNavigate()
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const unsubscribe = onSlowRequest(setSlow)
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark text-cream">
      <header className="border-b border-light/30 bg-blue shadow-md shadow-black/10">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-cream transition-colors hover:text-white"
          >
            BlogPost
          </Link>

          {userId ? (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/posts/new" className="btn-primary">
                New post
              </Link>

              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="text-light transition-colors hover:text-cream"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-4 text-sm">
              <Link to="/login" className="text-cream transition-colors hover:text-light">
                Log in
              </Link>
              <Link to="/register" className="text-cream transition-colors hover:text-light">
                Sign up
              </Link>
              <Link to="/about" className="text-cream transition-colors hover:text-light">
                About
              </Link>
            </div>
          )}
        </nav>
      </header>

      {slow && (
        <div className="border-b border-cream/20 bg-blue px-4 py-2 text-center text-sm text-cream">
          Waking up the server. It runs on a free plan and sleeps when idle,
          so this can take up to a minute.
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-light/20 py-8 text-center text-sm text-light">
        Built with FastAPI, PostgreSQL and React ·{' '}
        <a
          href="https://github.com/rrikia/practice_fastapi"
          className="underline transition-colors hover:text-cream"
        >
          Source on GitHub
        </a>
      </footer>
    </div>
  )
}
