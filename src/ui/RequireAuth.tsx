import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const KEY = 'adminAuthed'

export default function RequireAuth({ children }: { children: JSX.Element }){
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const isAuthed = localStorage.getItem(KEY) === '1'
    setAuthed(isAuthed)
    setChecking(false)
    if (!isAuthed) {
      navigate('/admin/prihlasenie', { replace: true, state: { from: location.pathname } })
    }
  }, [navigate, location.pathname])

  useEffect(() => {
    const onStorage = () => setAuthed(localStorage.getItem(KEY) === '1')
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (checking) return <div className="section"><div className="card">Kontrolujem prihlásenie…</div></div>
  if (!authed) return null
  return children
}
