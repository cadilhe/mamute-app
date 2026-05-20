import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Hexagon } from 'lucide-react'
import './Login.css'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email ou senha incorretos.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        <div className="login-logo">
          <Hexagon size={40} fill="var(--accent)" color="var(--accent)" />
          <h1>MAMUTE</h1>
        </div>
        <p className="login-sub">Plataforma de gestão educacional</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
