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
  student_dob: string // ISO date
  timeslots?: string[]
  level: string
  preferences: string | null
  submitted_at: string // ISO datetime
}

interface CampRegistration {
  id: string
  parent_name: string
  email: string
  camper_name: string
  camper_dob: string // ISO date
  preferred_week: string
  notes: string | null
  submitted_at: string // ISO datetime
}

type Tab = 'lessons' | 'camp'

export default function Admin(){
  const [tab, setTab] = useState<Tab>('lessons')
  const [lessons, setLessons] = useState<LessonInquiry[] | null>(null)
  const [camp, setCamp] = useState<CampRegistration[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const visible = tab === 'lessons' ? lessons : camp

  const exportCsv = () => {
    const rows = (tab === 'lessons' ? lessons : camp) ?? []
    const headers = tab === 'lessons'
      ? ['submitted_at','first_name','last_name','email','phone','student_name','student_dob','timeslots','level','preferences','id']
      : ['submitted_at','parent_name','email','camper_name','camper_dob','preferred_week','notes','id']
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
          <th>Dátum narodenia</th>
          <th>Termíny</th>
          <th>Úroveň</th>
          <th>Preferencie</th>
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
            <td>{r.student_name}</td>
            <td>{r.student_dob}</td>
            <td>{Array.isArray(r.timeslots) ? r.timeslots.join('; ') : ''}</td>
            <td>{r.level}</td>
            <td>{r.preferences ?? ''}</td>
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
          <th>Účastník</th>
          <th>Dátum narodenia</th>
          <th>Týždeň</th>
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
            <td>{r.camper_name}</td>
            <td>{r.camper_dob}</td>
            <td>{r.preferred_week}</td>
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
