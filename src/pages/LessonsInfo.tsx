import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LessonsInfo(){
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [course, setCourse] = useState<string>('Jesenný kurz')

  useEffect(() => {
    supabase.from('lesson_terms').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data){ setStart(data.start_date || null); setEnd(data.end_date || null); setCourse((data as any).course_name || 'Jesenný kurz') }
    })
  }, [])

  return (
    <div className="section">
      <h1>Plavecké lekcie</h1>
      <p className="muted">Objavte naše skupinové a individuálne lekcie pre deti rôznych úrovní.</p>

      <div className="card">
        <h2>{course}</h2>
        <p>
          <strong>{start || '22.9.2025'} – {end || '23.1.2026'}</strong>
          {' '}<span className="muted">(počas sviatkov a prázdnin sa nepláva)</span>
        </p>
        <h3>Výuka prebieha v dňoch</h3>
        <ul>
          <li>
            <strong>PONDELOK</strong>
            <ul>
              <li>16:30 – 17:30 — skupinové plávanie</li>
              <li>16:30 – 17:30 — kurz pre 3 – 4 ročné deti</li>
            </ul>
          </li>
          <li>
            <strong>UTOROK</strong>
            <ul>
              <li>17:00 – 18:00 — skupinové plávanie</li>
              <li>17:00 – 18:00 — kondičné plávanie</li>
              <li>17:00 – 18:00 — plávanie 11+</li>
            </ul>
          </li>
          <li>
            <strong>STREDA</strong>
            <ul>
              <li>18:30 – 19:30 — skupinové plávanie</li>
            </ul>
          </li>
          <li>
            <strong>ŠTVRTOK</strong>
            <ul>
              <li>16:30 – 17:30 — skupinové plávanie</li>
              <li>16:30 – 17:30 — kurz pre 3 – 4 ročné deti</li>
            </ul>
          </li>
          <li>
            <strong>PIATOK</strong>
            <ul>
              <li>17:00 – 18:00 — skupinové plávanie</li>
              <li>17:00 – 18:00 — kondičné plávanie</li>
              <li>17:00 – 18:00 — plávanie 11+</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="card">
        <h2>O programe</h2>
        <p>
          Kurzy prebiehajú v Aquapark Delňa Prešov. Ponúkame skupinové plávanie, kondičné plávanie,
          kurzy pre 3–4 ročné deti a špeciálne skupiny pre deti 11+.
        </p>
        <ul>
          <li>Malé skupiny a individuálny prístup</li>
          <li>Skúsení tréneri a bezpečné prostredie</li>
          <li>Flexibilné termíny počas týždňa</li>
        </ul>
      </div>

      <div className="card">
        <h2>Termíny a miesto</h2>
        <p>Aquapark Delňa Prešov. Aktuálne termíny nájdete vo formulári.</p>
      </div>


      <div className="card" style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2>Chcete sa prihlásiť?</h2>
          <p className="muted">Vyplňte krátky formulár a my sa vám ozveme do 1 pracovného dňa.</p>
        </div>
        <a className="button" href="/lekcie/prihlasenie">Prejsť na formulár</a>
      </div>
    </div>
  )
}
