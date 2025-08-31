import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LessonsInfo(){
  const [start, setStart] = useState<string | null>(null)
  const [end, setEnd] = useState<string | null>(null)
  const [course, setCourse] = useState<string>('Jesenný kurz')
  const [prices, setPrices] = useState<Record<string, { p2?: number | null; p1?: number | null }>>({})

  useEffect(() => {
    supabase.from('lesson_terms').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data){ setStart(data.start_date || null); setEnd(data.end_date || null); setCourse((data as any).course_name || 'Jesenný kurz') }
    })
    supabase.from('lesson_prices').select('*').then(({ data }) => {
      const rec: Record<string, { p2?: number | null; p1?: number | null }> = {}
      for (const r of (data as any[] || [])){
        rec[r.course_key] = { p2: r.price_2x == null ? null : Number(r.price_2x), p1: r.price_1x == null ? null : Number(r.price_1x) }
      }
      setPrices(rec)
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
        <h2>Členský príspevok: {course}</h2>
        <p className="muted">V prípade nastúpenia detí na plavecký kurz v neskoršom termíne, vám bude vypočítaná alikvótna čiastka z uvedenej sumy.</p>

  <h3>Kurz pre 3 – 4 ročné deti</h3>
        <p>
          Cieľom kurzu je oboznámenie detí s vodným prostredím, odstránenie strachu z vody a získanie základných zručností ako sú ponáranie, skoky do vody, splývanie a základy plávania…
          <em> (MAX v skupine 3 deti)</em>
        </p>
        <ul>
          <li><strong>{fmt(prices.kids_3_4?.p2, 415)} €</strong> / 2× týždenne</li>
          <li><strong>{fmt(prices.kids_3_4?.p1, 220)} €</strong> / 1× týždenne</li>
        </ul>

        <h3>Skupinové plávanie</h3>
        <p>
          Cieľom kurzu plávania pre neplavcov je osvojenie si základných plaveckých zručností – orientácia vo vode, správne dýchanie a osvojenie si základných plaveckých techník prsia, znak, kraul. Pre tých „lepších plavcov“ zdokonalenie všetkých plaveckých techník. Plavecký kurz je zakončený rôznymi súťažami v plávaní pre deti. Na konci zimného kurzu v januári a letného kurzu v júni každé dieťa dostane diplom za absolvovanie plaveckého kurzu.
          <em> (MAX v skupine 4 – 5 detí)</em>
        </p>
        <ul>
          <li><strong>{fmt(prices.group?.p2, 375)} €</strong> / 2× týždenne</li>
          <li><strong>{fmt(prices.group?.p1, 195)} €</strong> / 1× týždenne</li>
        </ul>

        <h3>Kondičné plávanie</h3>
        <p>
          Kondičné plávanie je vhodné pre tých, ktorí sa chcú zdokonaliť v plávaní, ale nechcú robiť výkonnostný šport, chcú dokázať, že vo vode vedia niečo viac ako druhí – plávať rýchlejšie, lepšie a vytrvalejšie.
        </p>
        <p>
          Cieľ: využitím prvkov športového tréningu zlepšiť plaveckú techniku, plaveckú vytrvalosť a rýchlosť, zvládnuť techniku všetkých plaveckých spôsobov, štartov a obrátok. Program je obohatený o základy potápania, vodného póla, synchronizovaného plávania, ako aj o zvládnutie základných záchranárskych techník a záchrany topiaceho sa.
          <em> (MAX v skupine 6 – 7 detí)</em>
        </p>
        <ul>
          <li><strong>{fmt(prices.kondicne?.p2, 345)} €</strong> / 2× týždenne</li>
          <li><strong>{fmt(prices.kondicne?.p1, 185)} €</strong> / 1× týždenne</li>
        </ul>

        <h3>Plávanie 11+</h3>
        <p>
          Kurz je určený pre deti so zvládnutým zdokonaľovacím plaveckým výcvikom, ide o formu tréningu v trvaní 60 minút. Na tréningu sa odstraňujú technické nedostatky pri jednotlivých plaveckých spôsoboch, pracuje sa na zvýšení celkovej fyzickej zdatnosti a kapacity pľúc pomocou použitia plaveckých pomôcok.
          <em> (MAX v skupine 6 – 7 detí)</em>
        </p>
        <ul>
          <li><strong>{fmt(prices['11plus']?.p2, 345)} €</strong> / 2× týždenne</li>
          <li><strong>{fmt(prices['11plus']?.p1, 185)} €</strong> / 1× týždenne</li>
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

function fmt(value: number | null | undefined, fallback: number){
  if (value == null || isNaN(Number(value))) return fallback
  return Number(value)
}
