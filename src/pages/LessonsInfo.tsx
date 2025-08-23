export default function LessonsInfo(){
  return (
    <div className="section">
      <h1>Plavecké lekcie</h1>
      <p className="muted">Objavte naše skupinové a individuálne lekcie pre deti rôznych úrovní.</p>

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
