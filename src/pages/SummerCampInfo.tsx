import { Link } from 'react-router-dom'

export default function SummerCampInfo(){
  return (
    <div className="section">
      <h1>Letný tábor SwimShark</h1>
      <p className="muted">Týždeň plný pohybu, vody a zábavy v bezpečnom prostredí so skúsenými trénermi.</p>

      <div className="card">
        <h2>Čo deti zažijú</h2>
        <ul>
          <li>Každodenné plavecké tréningy podľa úrovne</li>
          <li>Hry, suchá príprava a pohybové aktivity</li>
          <li>Bezpečnosť, hygiena a pitný režim</li>
          <li>Priateľská atmosféra a individuálny prístup</li>
        </ul>
      </div>

      <div className="card">
        <h2>Organizácia</h2>
        <ul>
          <li>Vek: od 4 rokov</li>
          <li>Miesto: Aquapark Delňa Prešov</li>
          <li>Trvanie: pondelok – piatok (5 dní)</li>
          <li>Skupiny podľa úrovne plávania</li>
        </ul>
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
