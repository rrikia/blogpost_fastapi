import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider, useAuth } from './auth'
import Layout from './components/Layout'
import Feed from './pages/Feed'
import Login from './pages/Login'
import PostDetail from './pages/PostDetail'
import PostForm from './pages/PostForm'
import Register from './pages/Register'
import About from './pages/About'

// The API requires a login for every post endpoint, so all post pages are protected
function RequireAuth({ children }: { children: ReactNode }) {
  const { userId } = useAuth()
  return userId ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/" element={<RequireAuth><Feed /></RequireAuth>} />
            <Route path="/posts/new" element={<RequireAuth><PostForm /></RequireAuth>} />
            <Route path="/posts/:id" element={<RequireAuth><PostDetail /></RequireAuth>} />
            <Route path="/posts/:id/edit" element={<RequireAuth><PostForm /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
