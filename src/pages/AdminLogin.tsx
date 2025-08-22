import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AdminLogin(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any

  useEffect(() => {
    if (localStorage.getItem('adminAuthed') === '1') navigate('/admin', { replace: true })
  }, [navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    await new Promise(r => setTimeout(r, 250))
    const expected = import.meta.env.VITE_ADMIN_PASSWORD
    if (!expected) {
      setLoading(false)
      setError('Heslo pre admina nie je nastavené na serveri')
      return
    }
    if (password !== expected) {
      setLoading(false)
      setError('Nesprávne heslo')
      return
    }
    localStorage.setItem('adminAuthed', '1')
    setLoading(false)
    const to = location?.state?.from || '/admin'
    navigate(to, { replace: true })
  }

  return (
    <div className="section">
      <h1>Prihlásenie admin</h1>
  <div className="card" style={{ maxWidth: 420 }}>
        <form className="form" onSubmit={onSubmit}>
          <div>
            <label>Heslo</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="button" disabled={loading}>{loading ? 'Prihlasujem…' : 'Prihlásiť sa'}</button>
        </form>
      </div>
    </div>
  )
}
