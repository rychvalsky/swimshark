import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

type ApplyForm = {
  studentFirstName: string
  studentLastName: string
  studentDob: string
  timeslots: string[]
  parentFirstName: string
  parentLastName: string
  email: string
  phone: string
  gdpr: boolean
  hasHealthIssues?: 'ano' | 'nie'
  healthIssues?: string
}

const TIMESLOT_OPTIONS = [
  'Pondelok (16:30 - 17:30) skupinové plávanie',
  'Pondelok (16:30 - 17:30) kurz pre 3 - 4 ročné deti',
  'Utorok (17:00 - 18:00) skupinové plávanie',
  'Utorok (17:00 - 18:00) kondičné plávanie',
  'Utorok (17:00 - 18:00) plávanie 11+',
  'Streda (18:30 - 19:30) skupinové plávanie',
  'Štvrtok (16:30 - 17:30) skupinové plávanie',
  'Štvrtok (16:30 - 17:30) kurz pre 3 - 4 ročné deti',
  'Piatok (17:00 - 18:00) skupinové plávanie',
  'Piatok (17:00 - 18:00) kondičné plávanie',
  'Piatok (17:00 - 18:00) plávanie 11+',
] as const

export default function Lessons(){
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, watch } = useForm<ApplyForm>()
  // Keep inputs enabled during submission; lock only after success to preserve values for validation
  const inputsLocked = isSubmitSuccessful
  const btnLocked = isSubmitting || isSubmitSuccessful
  const [showGdpr, setShowGdpr] = useState(false)

  const onSubmit = async (data: ApplyForm) => {
    const { error } = await supabase
      .from('lesson_inquiries')
      .insert({
  first_name: data.parentFirstName || '-',
  last_name: data.parentLastName || '-',
        email: data.email,
        phone: data.phone,
  // Backward compatibility: still populate student_name
  student_name: `${data.studentFirstName} ${data.studentLastName}`.trim(),
  // New: separate student name columns
  student_first_name: data.studentFirstName || '-',
  student_last_name: data.studentLastName || '-',
        student_dob: data.studentDob,
        timeslots: data.timeslots,
  level: 'nezaradene',
  preferences: null,
  health_issues: (data.hasHealthIssues === 'ano') ? (data.healthIssues?.trim() || null) : null,
        submitted_at: new Date().toISOString(),
      })
    if (error){
      alert(`Nepodarilo sa odoslať formulár: ${error.message}`)
      return
    }
    // Fire-and-forget confirmation email (best-effort)
    try {
      const to = data.email
      const subject = 'Potvrdenie: Žiadosť o plavecké lekcie – SwimShark'
      const text = `Dobrý deň,

ďakujeme za Vašu žiadosť o plavecké lekcie pre ${data.studentFirstName} ${data.studentLastName}. Čoskoro sa Vám ozveme s potvrdením termínu.

Zhrnutie:
- Termíny: ${(data.timeslots || []).join(', ')}
- Rodič: ${data.parentFirstName} ${data.parentLastName}
- Telefón: ${data.phone}

S pozdravom,
Tím SwimShark`
      const html = `<p>Dobrý deň,</p>
<p>ďakujeme za Vašu žiadosť o plavecké lekcie pre <strong>${data.studentFirstName} ${data.studentLastName}</strong>. Čoskoro sa Vám ozveme s potvrdením termínu.</p>
<p><strong>Zhrnutie:</strong><br/>Termíny: ${(data.timeslots || []).join(', ')}<br/>Rodič: ${data.parentFirstName} ${data.parentLastName}<br/>Telefón: ${data.phone}</p>
<p>S pozdravom,<br/>Tím SwimShark</p>`
      fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text, html })
      }).catch(() => {})
    } catch { /* ignore */ }
    alert('Ďakujeme! Vaša žiadosť bola odoslaná. Ozveme sa do 1 pracovného dňa.')
  }

  return (
    <div className="section">
      <h1>Prihlásenie na plavecké lekcie</h1>
      <p className="muted">Vyplňte formulár a vyberte preferované termíny.</p>

  <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <div className="row">
          <div>
            <label>Meno dieťaťa</label>
    <input className="input" disabled={inputsLocked} {...register('studentFirstName', { required: 'Meno je povinné' })} />
            {errors.studentFirstName && <div className="error">{errors.studentFirstName.message}</div>}
          </div>
          <div>
            <label>Priezvisko dieťaťa</label>
    <input className="input" disabled={inputsLocked} {...register('studentLastName', { required: 'Priezvisko je povinné' })} />
            {errors.studentLastName && <div className="error">{errors.studentLastName.message}</div>}
          </div>
        </div>

        

        <div>
          <label>Dátum narodenia</label>
          <input type="date" className="input" disabled={inputsLocked} {...register('studentDob', { required: 'Dátum narodenia je povinný' })} />
          {errors.studentDob && <div className="error">{errors.studentDob.message}</div>}
        </div>

        <div>
          <label>Vyberte si deň a čas (Aquapark Delňa Prešov) <span aria-hidden="true">*</span></label>
          <div className="options-grid">
            {TIMESLOT_OPTIONS.map((opt) => (
              <label key={opt} className="option-card">
                <input
                  type="checkbox"
                  value={opt}
                  disabled={inputsLocked}
                  {...register('timeslots', {
                    validate: (v) => (v && v.length > 0) || 'Vyberte aspoň jeden termín',
                  })}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          {errors.timeslots && <div className="error">{(errors as any).timeslots?.message || 'Vyberte aspoň jeden termín'}</div>}
        </div>

        <div className="row">
          <div>
            <label>Meno rodiča</label>
            <input className="input" disabled={inputsLocked} {...register('parentFirstName', { required: 'Meno rodiča je povinné' })} />
            {errors.parentFirstName && <div className="error">{errors.parentFirstName.message}</div>}
          </div>
          <div>
            <label>Priezvisko rodiča</label>
            <input className="input" disabled={inputsLocked} {...register('parentLastName', { required: 'Priezvisko rodiča je povinné' })} />
            {errors.parentLastName && <div className="error">{errors.parentLastName.message}</div>}
          </div>
        </div>
        <div className="row">
          <div>
            <label>Email rodiča</label>
            <input type="email" className="input" disabled={inputsLocked} {...register('email', { required: 'Email je povinný' })} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>
          <div>
            <label>Telefón rodiča</label>
            <input type="tel" className="input" disabled={inputsLocked} {...register('phone', { required: 'Telefón je povinný' })} />
            {errors.phone && <div className="error">{errors.phone.message}</div>}
          </div>
        </div>

  <div>
          <label>Má dieťa zdravotné obmedzenia?</label>
          <div className="options-column" role="group" aria-label="Zdravotné obmedzenia">
            <label className="checkbox">
              <input type="radio" value="nie" disabled={inputsLocked} {...register('hasHealthIssues', { required: 'Vyberte odpoveď' })} />
              <span>Nie</span>
            </label>
            <label className="checkbox">
              <input type="radio" value="ano" disabled={inputsLocked} {...register('hasHealthIssues', { required: 'Vyberte odpoveď' })} />
              <span>Áno</span>
            </label>
          </div>
          {errors.hasHealthIssues && <div className="error">{errors.hasHealthIssues.message as string}</div>}
        </div>

        {watch('hasHealthIssues') === 'ano' && (
          <div>
            <label htmlFor="healthIssues">Aké zdravotné obmedzenia?</label>
            <textarea
              id="healthIssues"
              className="textarea"
              rows={3}
              placeholder="Napr.: astma, alergia na chlór, kožné ochorenia, epilepsia, kardiovaskulárne ťažkosti, poruchy imunity, iné…"
              disabled={inputsLocked}
              aria-describedby="healthIssuesHelp"
              {...register('healthIssues', {
                validate: (v) => (watch('hasHealthIssues') !== 'ano' || (v && v.trim().length >= 3)) || 'Uveďte aspoň krátky popis',
              })}
            />
            <div id="healthIssuesHelp" className="helper">Uveďte prosím stručný popis a prípadné odporúčania lekára.</div>
            {errors.healthIssues && <div className="error">{errors.healthIssues.message as string}</div>}
          </div>
        )}

        <div>
          <label className="checkbox">
            <input type="checkbox" disabled={inputsLocked} {...register('gdpr', { required: 'Pred odoslaním musíte súhlasiť so spracúvaním osobných údajov' })} />
            <span>
              Súhlasím so spracúvaním osobných údajov
              {' '}(<button type="button" className="link-button" onClick={() => setShowGdpr(true)}>zobraziť úplné znenie</button>)
            </span>
          </label>
          {errors.gdpr && <div className="error">{errors.gdpr.message as string}</div>}
        </div>

  <button className="button" disabled={btnLocked}>{isSubmitting ? 'Odosielanie…' : (isSubmitSuccessful ? 'Odoslané' : 'Odoslať žiadosť')}</button>
      </form>

      {showGdpr && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="GDPR súhlas">
          <div className="modal-panel">
            <div className="modal-header">
              <strong>Spracúvanie osobných údajov</strong>
              <button className="modal-close" aria-label="Zavrieť" onClick={() => setShowGdpr(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                Súhlasím so spracúvaním osobných údajov podľa zákona č.18/2018 o ochrane osobných údajov na účely registrácie do plaveckých kurzov a sústredení, fakturácie a účtovníctva po dobu 10 rokov v rozsahu meno a priezvisko dieťaťa, dátum narodenia dieťaťa, meno a priezvisko rodiča, adresa, e-mail, telefón. Tieto údaje budú spracované výlučne pre potreby plaveckého klubu a nebudú poskytnuté ďalšej strane.
              </p>
            </div>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setShowGdpr(false)}>Zavrieť</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
