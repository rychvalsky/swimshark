import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

type LessonForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  studentFirstName: string
  studentLastName: string
  studentDob: string
  timeslots: string[]
  level: 'beginner'|'intermediate'|'advanced'
  preferences?: string
  consent: boolean
}

export default function Lessons(){
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<LessonForm>()
  const locked = isSubmitting || isSubmitSuccessful
  const [showGdpr, setShowGdpr] = useState(false)
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

  const onSubmit = async (data: LessonForm) => {
  const { error } = await supabase
      .from('lesson_inquiries')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
  phone: data.phone,
  student_name: `${data.studentFirstName} ${data.studentLastName}`,
        student_dob: data.studentDob,
        timeslots: data.timeslots,
        level: data.level,
        preferences: (data.preferences || '').trim() || null,
        submitted_at: new Date().toISOString(),
      })
    if (error) {
      alert(`Nepodarilo sa odoslať formulár: ${error.message}`)
      return
    }
    try {
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: 'Potvrdenie žiadosti – SwimShark',
          text: `Ahoj ${data.firstName},\n\nĎakujeme za odoslanie žiadosti o plavecké lekcie. Ozveme sa vám do 1 pracovného dňa.\n\nTím SwimShark`,
          html: `<p>Ahoj ${data.firstName},</p><p>Ďakujeme za odoslanie žiadosti o plavecké lekcie. Ozveme sa vám do 1 pracovného dňa.</p><p>Tím SwimShark</p>`
        })
      })
    } catch (e) {
      console.warn('Email send failed', e)
    }
    alert(`Ďakujeme, ${data.firstName}! Vaša žiadosť o lekcie bola prijatá.`)
  }

  return (
    <div className="section">
      <h1>Plavecké lekcie</h1>
      <p className="muted">Povedzte nám o plavcovi a odporučíme ideálnu skupinu.</p>

  <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        {/* Dieťa – meno a priezvisko */}
        <div className="row">
          <div>
            <label>Meno dieťaťa</label>
            <input className="input" disabled={locked} {...register('studentFirstName', { required: 'Meno dieťaťa je povinné' })} />
            {errors.studentFirstName && <div className="error">{errors.studentFirstName.message}</div>}
          </div>
          <div>
            <label>Priezvisko dieťaťa</label>
            <input className="input" disabled={locked} {...register('studentLastName', { required: 'Priezvisko dieťaťa je povinné' })} />
            {errors.studentLastName && <div className="error">{errors.studentLastName.message}</div>}
          </div>
        </div>

        {/* Dátum narodenia dieťaťa */
        }
        <div className="row">
          <div>
            <label>Dátum narodenia dieťaťa</label>
            <input type="date" className="input" disabled={locked} {...register('studentDob', { required: 'Dátum narodenia dieťaťa je povinný' })} />
            {errors.studentDob && <div className="error">{errors.studentDob.message}</div>}
          </div>
        </div>

        {/* Výber termínu (povinné) */}
        <div className="row">
          <div>
            <label>Vyberte si deň a čas (Aquapark Delňa Prešov) <span aria-hidden="true">*</span></label>
            <div className="options-column">
              {TIMESLOT_OPTIONS.map((opt) => (
                <label key={opt} className="checkbox">
                  <input
                    type="checkbox"
                    value={opt}
                    disabled={locked}
                    {...register('timeslots', {
                      validate: (v) => (v && (Array.isArray(v) ? v.length > 0 : true)) || 'Vyberte aspoň jeden termín',
                    })}
                  />{' '}
                  {opt}
                </label>
              ))}
            </div>
            {errors.timeslots && (
              <div className="error">Vyberte aspoň jeden termín</div>
            )}
          </div>
        </div>

        {/* Rodič – meno a priezvisko */}
        <div className="row">
          <div>
            <label>Meno rodiča</label>
            <input className="input" disabled={locked} {...register('firstName', { required: 'Meno rodiča je povinné' })} />
            {errors.firstName && <div className="error">{errors.firstName.message}</div>}
          </div>
          <div>
            <label>Priezvisko rodiča</label>
            <input className="input" disabled={locked} {...register('lastName', { required: 'Priezvisko rodiča je povinné' })} />
            {errors.lastName && <div className="error">{errors.lastName.message}</div>}
          </div>
        </div>

        {/* Kontakt na rodiča */}
        <div className="row">
          <div>
            <label>Email rodiča</label>
            <input type="email" className="input" disabled={locked} {...register('email', { required: 'Email je povinný' })} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>
          <div>
            <label>Telefón rodiča</label>
            <input type="tel" className="input" disabled={locked} {...register('phone', { required: 'Telefón je povinný' })} />
            {errors.phone && <div className="error">{errors.phone.message}</div>}
            <div className="helper">Ozveme sa vám iba ohľadom rezervácie.</div>
          </div>
        </div>

        <div className="row">
          <div>
            <label>Aktuálna úroveň</label>
      <select className="select" disabled={locked} {...register('level', { required: 'Vyberte úroveň' })}>
              <option value="">Vyberte úroveň</option>
              <option value="beginner">Začiatočník</option>
              <option value="intermediate">Mierne pokročilý</option>
              <option value="advanced">Pokročilý</option>
            </select>
            {errors.level && <div className="error">{errors.level.message}</div>}
          </div>
          <div>
            <label>Preferencie (voliteľné)</label>
      <input className="input" placeholder="Dni, časy, lokalita" disabled={locked} {...register('preferences')} />
          </div>
        </div>

        {/* Súhlas so spracovaním osobných údajov */}
        <div>
          <label className="checkbox">
            <input
              type="checkbox"
              disabled={locked}
              {...register('consent', { required: 'Pre odoslanie je potrebný súhlas so spracovaním osobných údajov' })}
            />
            <span>
              Súhlasím so spracovaním a uchovávaním osobných údajov pre účely rezervácie a kontaktovania.
              {' '}<button type="button" className="link-button" onClick={() => setShowGdpr(true)}>Zobraziť podmienky</button>
            </span>
          </label>
          {errors.consent && <div className="error">{errors.consent.message as any}</div>}
        </div>

        {showGdpr && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="gdpr-title" onClick={() => setShowGdpr(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 id="gdpr-title">Podmienky spracovania osobných údajov</h2>
                <button type="button" className="modal-close" aria-label="Zavrieť" onClick={() => setShowGdpr(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>
                  Súhlasím so spracúvaním osobných údajov podľa zákona č.18/2018 o ochrane osobných údajov na účely registrácie do plaveckých kurzov a sústredení, fakturácie a účtovníctva po dobu 10 rokov v rozsahu meno a priezvisko dieťaťa, dátum narodenia dieťaťa, meno a priezvisko rodiča, adresa, e-mail, telefón. Tieto údaje budú spracované výlučne pre potreby plaveckého klubu a nebudú poskytnuté ďalšej strane.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="button" onClick={() => setShowGdpr(false)}>Zavrieť</button>
              </div>
            </div>
          </div>
        )}

    <button className="button" disabled={locked}>{isSubmitting ? 'Odosielanie…' : (isSubmitSuccessful ? 'Odoslané' : 'Požiadať o lekcie')}</button>
    {isSubmitSuccessful && <div className="helper">Odpovieme do 1 pracovného dňa.</div>}
      </form>
    </div>
  )
}
