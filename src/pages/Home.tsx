import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home(){
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [course, setCourse] = useState<string>('Jesenný kurz')

  useEffect(() => {
    supabase.from('lesson_terms').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data){ setStart(data.start_date || null); setEnd(data.end_date || null); setCourse((data as any).course_name || 'Jesenný kurz') }
    })
  }, [])
  return (
    <div className="home">
      <section className="hero">
        <div>
          <h1>Sebavedomí plavci začínajú u nás</h1>
          <p>Od prvých špliechov až po pretekárske štýly – SwimShark buduje istotu vo vode a techniku pre všetky veky v bezpečnom a zábavnom prostredí.</p>
          <div className="cta">
            <Link to="/lekcie" className="button">Rezervovať lekcie</Link>
            <Link to="/letny-tabor" className="button secondary">Letný tábor</Link>
          </div>
          <p className="helper" style={{ marginTop: 8 }}>
            {course}: <strong>{start || '22.9.2025'} – {end || '23.1.2026'}</strong> <span className="muted">(počas sviatkov a prázdnin sa nepláva)</span>
          </p>
        </div>
        <div className="card">
          <h3>Prečo SwimShark?</h3>
          <ul>
            <li>Certifikovaní, starostliví inštruktori</li>
            <li>Malé skupiny</li>
            <li>Flexibilné termíny</li>
            <li>Moderné, teplé kryté bazény</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>Programy</h2>
        <p className="muted">Na mieru pre každý vek a úroveň zručností.</p>
        <div className="card-grid">
          <div className="card">
            <h3>Deti (4–12)</h3>
            <p className="muted">Zábava a pokrok, bezpečnosť na prvom mieste.</p>
          </div>
          <div className="card">
            <h3>Tínedžeri</h3>
            <p className="muted">Technika, vytrvalosť a sebavedomie.</p>
          </div>
          <div className="card">
            <h3>Dospelí</h3>
            <p className="muted">Od začiatočníkov po pokročilých, vlastným tempom.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
