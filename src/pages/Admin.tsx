import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Row types (mirror DB schema)
interface LessonInquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  student_name: string
  student_first_name?: string
  student_last_name?: string
  student_dob: string // ISO date
  timeslots?: string[]
  level: string
  preferences: string | null
  has_health_issues?: boolean
  health_issues?: string | null
  submitted_at: string // ISO datetime
}

interface CampRegistration {
  id: string
  parent_name: string
  email: string
  parent_phone?: string | null
  camper_name: string
  camper_dob: string // ISO date
  preferred_week: string
  t_shirt_size?: string | null
  notes: string | null
  submitted_at: string // ISO datetime
  campers?: { name: string; dob: string; size?: string }[] | null
}

type Tab = 'lessons' | 'camp'

export default function Admin(){
  const [tab, setTab] = useState<Tab>('lessons')
  const [lessons, setLessons] = useState<LessonInquiry[] | null>(null)
  const [camp, setCamp] = useState<CampRegistration[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Lesson terms editor state
  const [ltStart, setLtStart] = useState<string>('')
  const [ltEnd, setLtEnd] = useState<string>('')
  const [ltCourse, setLtCourse] = useState<string>('Jesenný kurz')
  const [ltLoading, setLtLoading] = useState<boolean>(false)
  const [ltSaving, setLtSaving] = useState<boolean>(false)
  const [ltMsg, setLtMsg] = useState<string | null>(null)

  const load = async (which: Tab | 'both' = 'both') => {
    setLoading(true)
    setError(null)
    try {
      if (which === 'lessons' || which === 'both'){
        const { data, error } = await supabase
          .from('lesson_inquiries')
          .select('*')
          .order('submitted_at', { ascending: false })
        if (error) throw error
        setLessons(data as LessonInquiry[])
      }
      if (which === 'camp' || which === 'both'){
        const { data, error } = await supabase
          .from('camp_registrations')
          .select('*')
          .order('submitted_at', { ascending: false })
        if (error) throw error
        setCamp(data as CampRegistration[])
      }
    } catch (e: any){
      setError(e?.message ?? 'Nepodarilo sa načítať dáta')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load('both') }, [])
  useEffect(() => { loadLessonTerms() }, [])

  async function loadLessonTerms(){
    try{
      setLtLoading(true)
      setLtMsg(null)
      const { data, error } = await supabase.from('lesson_terms').select('*').eq('id', 1).maybeSingle()
      if (error) throw error
      if (data){
        setLtStart(data.start_date ?? '')
        setLtEnd(data.end_date ?? '')
  setLtCourse((data as any).course_name ?? 'Jesenný kurz')
      }
    } catch(e:any){
      setLtMsg(e?.message || 'Nepodarilo sa načítať termíny')
    } finally {
      setLtLoading(false)
    }
  }

  async function saveLessonTerms(){
    try{
      setLtSaving(true)
      setLtMsg(null)
      const payload: any = { id: 1, start_date: ltStart || null, end_date: ltEnd || null, course_name: ltCourse || null, updated_at: new Date().toISOString() }
      let { error } = await supabase.from('lesson_terms').upsert(payload, { onConflict: 'id' })
      if (error){
        const msg = (error.message || '').toLowerCase()
        if (msg.includes('course_name')){
          // Retry without course_name to keep dates working and hint migration
          const retry = await supabase.from('lesson_terms').upsert({ id: 1, start_date: ltStart || null, end_date: ltEnd || null, updated_at: new Date().toISOString() }, { onConflict: 'id' })
          if (retry.error){ throw retry.error }
          setLtMsg('Uložené (poznámka: pridajte stĺpec course_name do lesson_terms)')
          return
        }
        throw error
      }
      setLtMsg('Uložené')
    } catch(e:any){
      setLtMsg(e?.message || 'Ukladanie zlyhalo')
    } finally {
      setLtSaving(false)
    }
  }

  const visible = tab === 'lessons' ? lessons : camp

  const exportCsv = () => {
    const rows = (tab === 'lessons' ? lessons : camp) ?? []
    const headers = tab === 'lessons'
      ? [
          'submitted_at',
          'first_name','last_name','email','phone',
          'student_first_name','student_last_name','student_name',
          'student_dob','timeslots','level','preferences',
          // New: health flags
          'has_health_issues','health_issues','id'
        ]
  : ['submitted_at','parent_name','email','parent_phone','camper_name','camper_dob','preferred_week','t_shirt_size','notes','campers','id']
    const csv = [headers.join(',')]
    for (const r of rows as any[]){
      const line = headers.map(h => JSON.stringify((r as any)[h] ?? ''))
      csv.push(line.join(','))
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tab === 'lessons' ? 'lesson_inquiries.csv' : 'camp_registrations.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="section">
      <h1>Administrácia</h1>
      <p className="muted">Prehľad odoslaných formulárov (len na interné účely).</p>

      <div className="card" style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8 }}>
          <button className={`button ${tab==='lessons' ? '' : 'secondary'}`} onClick={() => setTab('lessons')}>Lekcie</button>
          <button className={`button ${tab==='camp' ? '' : 'secondary'}`} onClick={() => setTab('camp')}>Tábor</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="button secondary" onClick={() => load(tab)} disabled={loading}>{loading ? 'Načítavam…' : 'Obnoviť'}</button>
          <button className="button" onClick={exportCsv} disabled={!visible || visible.length === 0}>Export CSV</button>
          <button className="button secondary" onClick={() => { localStorage.removeItem('adminAuthed'); window.location.href='/admin/prihlasenie' }}>Odhlásiť</button>
        </div>
      </div>
      {error && <div className="card" style={{ borderColor:'#fecaca', color:'#991b1b' }}>Chyba: {error}</div>}

      <div className="card" style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
        <div style={{ display:'grid', gap:8 }}>
          <label style={{ fontWeight:600 }}>Názov kurzu</label>
          <select className="select" value={ltCourse} onChange={e => setLtCourse(e.target.value)} disabled={ltLoading || ltSaving}>
            <option>Jesenný kurz</option>
            <option>Jarný kurz</option>
            <option>Zimný kurz</option>
          </select>
        </div>
        <div style={{ display:'grid', gap:8 }}>
          <label style={{ fontWeight:600 }}>Termíny lekcií (od – do)</label>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" type="date" value={ltStart} onChange={e => setLtStart(e.target.value)} disabled={ltLoading || ltSaving} />
            <input className="input" type="date" value={ltEnd} onChange={e => setLtEnd(e.target.value)} disabled={ltLoading || ltSaving} />
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="button secondary" onClick={loadLessonTerms} disabled={ltLoading || ltSaving}>{ltLoading ? 'Načítavam…' : 'Načítať'}</button>
          <button className="button" onClick={saveLessonTerms} disabled={ltLoading || ltSaving}>{ltSaving ? 'Ukladám…' : 'Uložiť'}</button>
        </div>
        {ltMsg && <div className="helper">{ltMsg}</div>}
      </div>

      <div className="card" style={{ overflowX:'auto' }}>
        {tab === 'lessons' ? <LessonsTable rows={lessons} /> : <CampTable rows={camp} />}
      </div>
    </div>
  )
}

function LessonsTable({ rows }: { rows: LessonInquiry[] | null }){
  if (!rows) return <div className="muted">Načítavam…</div>
  if (rows.length === 0) return <div className="muted">Žiadne záznamy</div>
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Odoslané</th>
          <th>Meno</th>
          <th>Priezvisko</th>
          <th>Email</th>
          <th>Telefón</th>
          <th>Meno plavca</th>
          <th>Priezvisko plavca</th>
          <th>Dátum narodenia</th>
          <th>Termíny</th>
          <th>Úroveň</th>
          <th>Preferencie</th>
          <th>Zdravotné obmedzenia</th>
          <th>Popis obmedzení</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>{formatDateTime(r.submitted_at)}</td>
            <td>{r.first_name}</td>
            <td>{r.last_name}</td>
            <td>{r.email}</td>
            <td>{r.phone ?? ''}</td>
            <td>{r.student_first_name ?? (r.student_name?.split(' ')[0] ?? '')}</td>
            <td>{r.student_last_name ?? (r.student_name?.split(' ').slice(1).join(' ') ?? '')}</td>
            <td>{r.student_dob}</td>
            <td>{Array.isArray(r.timeslots) ? r.timeslots.join('; ') : ''}</td>
            <td>{r.level}</td>
            <td>{r.preferences ?? ''}</td>
            <td>{r.has_health_issues === true ? 'Áno' : (r.has_health_issues === false ? 'Nie' : '')}</td>
            <td>{r.health_issues ?? ''}</td>
            <td className="muted" title={r.id}>{r.id.slice(0,8)}…</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CampTable({ rows }: { rows: CampRegistration[] | null }){
  if (!rows) return <div className="muted">Načítavam…</div>
  if (rows.length === 0) return <div className="muted">Žiadne záznamy</div>
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Odoslané</th>
          <th>Rodič</th>
          <th>Email</th>
          <th>Telefón</th>
          <th>Účastník (1.)</th>
          <th>Dátum narodenia (1.)</th>
          <th>Ďalší účastníci</th>
          <th>Týždeň</th>
          <th>Veľkosť trička</th>
          <th>Poznámky</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>{formatDateTime(r.submitted_at)}</td>
            <td>{r.parent_name}</td>
            <td>{r.email}</td>
            <td>{r.parent_phone ?? ''}</td>
            <td>{r.camper_name}</td>
            <td>{r.camper_dob}</td>
            <td>{Array.isArray(r.campers) && r.campers.length > 1 ? r.campers.slice(1).map(c => `${c.name} (${c.dob}${c.size ? `, tričko: ${c.size}` : ''})`).join('; ') : ''}</td>
            <td>{r.preferred_week}</td>
            <td>{r.t_shirt_size ?? ''}</td>
            <td>{r.notes ?? ''}</td>
            <td className="muted" title={r.id}>{r.id.slice(0,8)}…</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatDateTime(iso: string){
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}
