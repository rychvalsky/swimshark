import { Link } from 'react-router-dom'

export default function Home(){
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
