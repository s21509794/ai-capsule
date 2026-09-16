import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Navbar({ user }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Navigate to /logout which Express handles (clears cookie + redirects)
      window.location.href = '/logout'
    } catch {
      navigate('/')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">🧠</div>
          AI Capsule
        </Link>

        <div className="navbar-right">
          {user ? (
            <>
              <div className="navbar-user">
                {user.avatar && (
                  <img src={user.avatar} alt={user.username} className="navbar-avatar" />
                )}
                <span className="navbar-username">{user.username || user.email}</span>
              </div>
              <button
                id="logout-btn"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-primary btn-sm" id="nav-login-btn">
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
