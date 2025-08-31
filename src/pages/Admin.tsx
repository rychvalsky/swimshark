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
  // Camp turnuses editor state
  type Turnus = { id?: number; position: number; label: string; start_date: string | null; end_date: string | null; is_full?: boolean }
  const [turnuses, setTurnuses] = useState<Turnus[]>([])
  const [tuLoading, setTuLoading] = useState<boolean>(false)
  const [tuSaving, setTuSaving] = useState<boolean>(false)
  const [tuMsg, setTuMsg] = useState<string | null>(null)

  // Camp settings (price)
  const [csPrice, setCsPrice] = useState<string>('179')
  const [csLoading, setCsLoading] = useState<boolean>(false)
  const [csSaving, setCsSaving] = useState<boolean>(false)
  const [csMsg, setCsMsg] = useState<string | null>(null)

  // Lesson prices (per course: 2x/1x weekly)
  type LessonPrice = { id?: number; course_key: string; course_label: string; price_2x?: number | null; price_1x?: number | null }
  const DEFAULT_LESSON_PRICES: LessonPrice[] = [
    { course_key: 'kids_3_4', course_label: 'Kurz pre 3 – 4 ročné deti', price_2x: 415, price_1x: 220 },
    { course_key: 'group', course_label: 'Skupinové plávanie', price_2x: 375, price_1x: 195 },
    { course_key: 'kondicne', course_label: 'Kondičné plávanie', price_2x: 345, price_1x: 185 },
    { course_key: '11plus', course_label: 'Plávanie 11+', price_2x: 345, price_1x: 185 },
  ]
  const [lpRows, setLpRows] = useState<LessonPrice[]>(DEFAULT_LESSON_PRICES)
  const [lpLoading, setLpLoading] = useState<boolean>(false)
  const [lpSaving, setLpSaving] = useState<boolean>(false)
  const [lpMsg, setLpMsg] = useState<string | null>(null)

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
  useEffect(() => { loadCampTurnuses() }, [])
  useEffect(() => { loadCampSettings() }, [])
  useEffect(() => { loadLessonPrices() }, [])

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

  async function loadCampTurnuses(){
    try{
      setTuLoading(true)
      setTuMsg(null)
      const { data, error } = await supabase.from('camp_turnuses').select('*').order('position', { ascending: true })
      if (error) throw error
      const list = (data as any[] || []).map((r, idx) => ({
        id: r.id,
        position: r.position ?? (idx + 1),
        label: r.label ?? `${idx + 1}. turnus`,
        start_date: r.start_date ?? null,
        end_date: r.end_date ?? null,
        is_full: r.is_full ?? false,
      }))
      setTurnuses(list)
      if (list.length === 0){
        // Seed with 3 empty rows for convenience
        setTurnuses([
          { position: 1, label: '1. turnus', start_date: null, end_date: null, is_full: false },
          { position: 2, label: '2. turnus', start_date: null, end_date: null, is_full: false },
          { position: 3, label: '3. turnus', start_date: null, end_date: null, is_full: false },
        ])
      }
    } catch(e:any){
      const msg = e?.message || 'Nepodarilo sa načítať turnusy'
      setTuMsg(msg)
    } finally {
      setTuLoading(false)
    }
  }

  async function saveCampTurnuses(){
    try{
      setTuSaving(true)
      setTuMsg(null)
      const payload = turnuses.map(t => ({
        id: t.id,
        position: t.position,
        label: t.label,
        start_date: t.start_date || null,
        end_date: t.end_date || null,
        is_full: !!t.is_full,
        updated_at: new Date().toISOString(),
      }))
      let { error } = await supabase.from('camp_turnuses').upsert(payload, { onConflict: 'id' })
      if (error){
        const m = (error.message || '').toLowerCase()
        if (m.includes('camp_turnuses')){
          setTuMsg('Uloženie zlyhalo: Vytvorte tabuľku camp_turnuses (stĺpce: id, position, label, start_date, end_date, is_full, updated_at)')
          return
        }
        throw error
      }
      setTuMsg('Uložené')
      await loadCampTurnuses()
    } catch(e:any){
      setTuMsg(e?.message || 'Ukladanie zlyhalo')
    } finally {
      setTuSaving(false)
    }
  }

  async function loadCampSettings(){
    try{
      setCsLoading(true)
      setCsMsg(null)
      const { data, error } = await supabase.from('camp_settings').select('*').eq('id', 1).maybeSingle()
      if (error) throw error
      if (data){
        const price = (data as any).price_eur
        setCsPrice(price != null ? String(price) : '179')
      }
    } catch(e:any){
      // Silently ignore if table missing, but show hint if needed via manual action
      setCsMsg(e?.message || 'Nepodarilo sa načítať nastavenia tábora')
    } finally {
      setCsLoading(false)
    }
  }

  async function saveCampSettings(){
    try{
      setCsSaving(true)
      setCsMsg(null)
      const priceNumber = csPrice ? Number(csPrice) : null
      const payload: any = { id: 1, price_eur: priceNumber, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('camp_settings').upsert(payload, { onConflict: 'id' })
      if (error){
        const m = (error.message || '').toLowerCase()
        // Detect common RLS/permission problems and provide helpful hints
        if (m.includes('permission denied') || m.includes('row level security') || m.includes('no insert policy') || m.includes('violates row-level security')){
          setCsMsg('Uloženie zlyhalo: povoľte RLS politiky INSERT/UPDATE pre camp_settings (pozri README – camp_settings policies).')
          return
        }
        // Table missing (less likely if you already created it)
        if (m.includes('relation') && m.includes('camp_settings')){
          setCsMsg('Uloženie zlyhalo: Vytvorte tabuľku camp_settings (stĺpce: id, price_eur, updated_at) – viď README.')
          return
        }
        throw error
      }
      setCsMsg('Uložené')
    } catch(e:any){
      setCsMsg(e?.message || 'Ukladanie zlyhalo')
    } finally {
      setCsSaving(false)
    }
  }

  async function loadLessonPrices(){
    try{
      setLpLoading(true)
      setLpMsg(null)
      const { data, error } = await supabase.from('lesson_prices').select('*').order('course_label', { ascending: true })
      if (error) throw error
      const rows = (data as any[] | null) ?? []
      if (rows.length === 0){
        setLpRows(DEFAULT_LESSON_PRICES)
        return
      }
      const mapped: LessonPrice[] = rows.map(r => ({
        id: r.id,
        course_key: r.course_key,
        course_label: r.course_label,
        price_2x: r.price_2x == null ? null : Number(r.price_2x),
        price_1x: r.price_1x == null ? null : Number(r.price_1x),
      }))
      // Keep only known courses order; append unknowns at end
      const order = DEFAULT_LESSON_PRICES.map(r => r.course_key)
      mapped.sort((a,b) => order.indexOf(a.course_key) - order.indexOf(b.course_key))
      setLpRows(mapped)
    } catch(e:any){
      setLpMsg(e?.message || 'Nepodarilo sa načítať ceny lekcií')
    } finally {
      setLpLoading(false)
    }
  }

  async function saveLessonPrices(){
    try{
      setLpSaving(true)
      setLpMsg(null)
      const payload = lpRows.map(r => ({
        id: r.id,
        course_key: r.course_key,
        course_label: r.course_label,
        price_2x: r.price_2x == null || isNaN(Number(r.price_2x)) ? null : Number(r.price_2x),
        price_1x: r.price_1x == null || isNaN(Number(r.price_1x)) ? null : Number(r.price_1x),
        updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase.from('lesson_prices').upsert(payload, { onConflict: 'course_key' })
      if (error){
        const m = (error.message || '').toLowerCase()
        if (m.includes('permission denied') || m.includes('row level security') || m.includes('no insert policy') || m.includes('violates row-level security')){
          setLpMsg('Uloženie zlyhalo: povoľte RLS politiky SELECT/INSERT/UPDATE pre lesson_prices (pozri README – lesson_prices).')
          return
        }
        if (m.includes('relation') && m.includes('lesson_prices')){
          setLpMsg('Uloženie zlyhalo: Vytvorte tabuľku lesson_prices (stĺpce: id, course_key, course_label, price_2x, price_1x, updated_at) – viď README.')
          return
        }
        throw error
      }
      setLpMsg('Uložené')
      await loadLessonPrices()
    } catch(e:any){
      setLpMsg(e?.message || 'Ukladanie zlyhalo')
    } finally {
      setLpSaving(false)
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

      <div className="card" style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <strong>Nastavenia tábora</strong>
          <div style={{ display:'flex', gap:8 }}>
            <button className="button secondary" onClick={loadCampSettings} disabled={csLoading || csSaving}>{csLoading ? 'Načítavam…' : 'Načítať'}</button>
            <button className="button" onClick={saveCampSettings} disabled={csLoading || csSaving}>{csSaving ? 'Ukladám…' : 'Uložiť'}</button>
          </div>
        </div>
        {csMsg && <div className="helper">{csMsg}</div>}
        <div style={{ display:'grid', gap:8, maxWidth: 280 }}>
          <label style={{ fontWeight:600 }}>Cena letného tábora (EUR)</label>
          <input className="input" type="number" min={0} step={1} value={csPrice} onChange={e => setCsPrice(e.target.value)} disabled={csLoading || csSaving} />
        </div>
      </div>

      <div className="card" style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <strong>Cenník plaveckých lekcií</strong>
          <div style={{ display:'flex', gap:8 }}>
            <button className="button secondary" onClick={loadLessonPrices} disabled={lpLoading || lpSaving}>{lpLoading ? 'Načítavam…' : 'Načítať'}</button>
            <button className="button" onClick={saveLessonPrices} disabled={lpLoading || lpSaving}>{lpSaving ? 'Ukladám…' : 'Uložiť'}</button>
          </div>
        </div>
        {lpMsg && <div className="helper">{lpMsg}</div>}
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kurz</th>
                <th>2× týždenne (€)</th>
                <th>1× týždenne (€)</th>
              </tr>
            </thead>
            <tbody>
              {lpRows.map((r, idx) => (
                <tr key={r.course_key}>
                  <td>{r.course_label}</td>
                  <td style={{ maxWidth: 140 }}>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      step={1}
                      value={r.price_2x ?? ''}
                      onChange={e => {
                        const v = e.target.value
                        setLpRows(rows => rows.map((x,i) => i===idx ? { ...x, price_2x: v === '' ? null : Number(v) } : x))
                      }}
                      disabled={lpLoading || lpSaving}
                    />
                  </td>
                  <td style={{ maxWidth: 140 }}>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      step={1}
                      value={r.price_1x ?? ''}
                      onChange={e => {
                        const v = e.target.value
                        setLpRows(rows => rows.map((x,i) => i===idx ? { ...x, price_1x: v === '' ? null : Number(v) } : x))
                      }}
                      disabled={lpLoading || lpSaving}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <strong>Turnusy letného tábora</strong>
          <div style={{ display:'flex', gap:8 }}>
            <button className="button secondary" onClick={loadCampTurnuses} disabled={tuLoading || tuSaving}>{tuLoading ? 'Načítavam…' : 'Načítať'}</button>
            <button className="button" onClick={saveCampTurnuses} disabled={tuLoading || tuSaving}>{tuSaving ? 'Ukladám…' : 'Uložiť'}</button>
          </div>
        </div>
        {tuMsg && <div className="helper">{tuMsg}</div>}
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Názov</th>
                <th>Od</th>
                <th>Do</th>
                <th>Obsadené</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {turnuses.map((t, idx) => (
                <tr key={t.id ?? idx}>
                  <td>{t.position}</td>
                  <td>
                    <input className="input" value={t.label}
                           onChange={e => setTurnuses(v => v.map((x,i) => i===idx ? { ...x, label: e.target.value } : x))} />
                  </td>
                  <td>
                    <input type="date" className="input" value={t.start_date ?? ''}
                           onChange={e => setTurnuses(v => v.map((x,i) => i===idx ? { ...x, start_date: e.target.value || null } : x))} />
                  </td>
                  <td>
                    <input type="date" className="input" value={t.end_date ?? ''}
                           onChange={e => setTurnuses(v => v.map((x,i) => i===idx ? { ...x, end_date: e.target.value || null } : x))} />
                  </td>
                  <td>
                    <label className="checkbox" style={{ userSelect:'none' }}>
                      <input type="checkbox" checked={!!t.is_full}
                             onChange={e => setTurnuses(v => v.map((x,i) => i===idx ? { ...x, is_full: e.target.checked } : x))} />
                      <span>Obsadené</span>
                    </label>
                  </td>
                  <td>
                    <button className="button secondary" onClick={() => setTurnuses(v => v.filter((_,i) => i!==idx))}>Zmazať</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <button className="button secondary" onClick={() => setTurnuses(v => {
            const pos = (v[v.length-1]?.position ?? 0) + 1
            return [...v, { position: pos, label: `${pos}. turnus`, start_date: null, end_date: null, is_full: false }]
          })}>Pridať turnus</button>
        </div>
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
