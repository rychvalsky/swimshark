import { Link } from 'react-router-dom'

export default function SummerCampInfo(){
  return (
    <div className="section">
      <h1>Letný tábor SwimShark</h1>
      <p className="muted">Týždeň plný pohybu, vody a zábavy v bezpečnom prostredí so skúsenými trénermi.</p>

      <div className="card">
        <h2>Filozofia tábora</h2>
        <p>
          FILOZOFIOU NÁŠHO TÁBORA NIE JE DETI NAUČIŤ PLÁVAŤ,ALE AJ MILOVAŤ VODU. NÁŠ DENNÝ PLAVECKÝ TÁBOR PRINÁŠA DEŤOM RADOSŤ NIELEN Z VODY, ALE AJ ZO ŠPORTU. TAK AKO KAŽDÝ ROK, AJ TENTO ORGANIZUJEME DENNÝ TÁBOR, KTORÝ JE URČENÝ PRE DETI OD 4 DO 13 ROKOV.
        </p>
      </div>

      <div className="card">
        <h2>Program a zameranie</h2>
        <p>
          V dennom letnom tábore pripravíme pre vaše ratolesti pestrý športový program a zábavnou formou si spoločne spríjemníme letné týždne. K hlavnému programu táborov patrí najmä plávanie, ďalej rôzne motorické cvičenia, atletika, skupinové hry (futbal, volejbal..), noc maškrtníkov a iné. Náš tábor je určený pre neplavcov ako aj plavcov.
        </p>
        <p>
          Po absolvovaní týždenného plaveckého tábora si deti osvoja základné plavecké zručnosti,ako je splývanie, dýchanie do vody, potápanie, skoky do vody, ale predovšetkým sa naučia pohybovať vo vodnom prostredí bez zábran s potešením. Naši plavci si zlepšia techniku plávania ako aj kondíciu. Ak chcete, aby vaše dieťa malo cez prázdniny bohatý program a budovalo si pozitívny vzťah k športu, neváhajte a prihláste ho čím skôr.
        </p>
        <p>
          Okrem športových aktivít bude pre vaše dieťa zabezpečený celodenný pitný režim a tiež strava (desiata, obed, olovrant). Zážitky z tábora pre vás s radosťou zdokumentujeme a fotografie budú dostupné na našej stránke po skončení akcie.
        </p>
      </div>

      <div className="card">
        <h2>Cena</h2>
        <p>Cena tábora je <strong>179 €</strong>. (možnosť financovať aj prostredníctvom rekreačného poukazu)</p>
        <p><em>akcia DUO 5 eur zľava (súrodenec zľava)</em></p>
      </div>

      <div className="card">
        <h2>Turnusy a dátumy</h2>
        <ul>
          <li>1. turnus — 30.6 – 4.7.2025</li>
          <li>2. turnus — 7.7 – 11.7.2025</li>
          <li>3. turnus — 14.7 – 18.7.2025</li>
          <li>4. turnus — 21.7 – 25.7.2025</li>
          <li><strong>5. turnus OBSADENÉ</strong> — 28.7 – 1.8.2025</li>
          <li><strong>6. turnus OBSADENÉ</strong> — 4.8 – 8.8.2025</li>
        </ul>
      </div>

      <div className="card">
        <h2>Miesto a čas</h2>
        <p>Tábory sa uskutočňujú v krásnom areáli prirodného kúpaliska Delňa. Výučba plávania prebieha v areáli Aquaparku Delňa.</p>
        <p>Brány nášho plaveckého tábora sú otvorené od <strong>7:00</strong> hod. do <strong>16:30</strong> hod.</p>
      </div>

      <div className="card">
        <h2>Prihlásenie a kapacita</h2>
        <p>Prihlásiť svoje deti môžete jednoducho prostredníctvom rezervačného systému.</p>
        <p>Počet miest je limitovaný, preto neváhajte a prihláste svoje deti čím skôr. (<strong>6 deti na inštruktora</strong>)</p>
        <p>Prihlásenie prostredníctvom rezervačného systému slúži ako záväzná prihláška, nemusíte teda tlačiť žiadne papiere. V prípade obmedzení, alebo iných potrebných informácií, o ktorých by mali inštruktori vedieť, nás môžete kontaktovať e-mailom na <a href="mailto:plavanieshark@gmail.com">plavanieshark@gmail.com</a>.</p>
        <div style={{ marginTop: 8 }}>
          <Link className="button" to="/letny-tabor/prihlasenie">Prejsť na prihlášku</Link>
        </div>
      </div>

      <div className="card">
        <h2>Kontakt</h2>
        <p>Viac informácií vám radi poskytneme na tel. čísle: <a href="tel:+421948284482">+421 948 284 482</a>, alebo e-mailom na <a href="mailto:plavanieshark@gmail.com">plavanieshark@gmail.com</a>. Tešíme sa na leto plné zážitkov, športu a zábavy.</p>
        <p>S pozdravom,</p>
        <p><strong>Plavecká škola SWIMSHARK</strong></p>
      </div>

      <div className="card" style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2>Chcete sa prihlásiť?</h2>
          <p className="muted">Vyplňte krátky formulár a miesta potvrdíme e‑mailom.</p>
        </div>
        <Link className="button" to="/letny-tabor/prihlasenie">Prejsť na prihlášku</Link>
      </div>
    </div>
  )
}
