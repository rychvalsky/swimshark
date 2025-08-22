import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

type LessonForm = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  studentName: string
  studentDob: string
  level: 'beginner'|'intermediate'|'advanced'
  preferences?: string
}

export default function Lessons(){
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<LessonForm>()
  const locked = isSubmitting || isSubmitSuccessful

  const onSubmit = async (data: LessonForm) => {
  const { error } = await supabase
      .from('lesson_inquiries')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        student_name: data.studentName,
        student_dob: data.studentDob,
        level: data.level,
        preferences: data.preferences ?? null,
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
        <div className="row">
          <div>
            <label>Meno</label>
    <input className="input" disabled={locked} {...register('firstName', { required: 'Meno je povinné' })} />
            {errors.firstName && <div className="error">{errors.firstName.message}</div>}
          </div>
          <div>
            <label>Priezvisko</label>
    <input className="input" disabled={locked} {...register('lastName', { required: 'Priezvisko je povinné' })} />
            {errors.lastName && <div className="error">{errors.lastName.message}</div>}
          </div>
        </div>

        <div className="row">
          <div>
            <label>Email</label>
            <input type="email" className="input" disabled={locked} {...register('email', { required: 'Email je povinný' })} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>
          <div>
            <label>Telefón (voliteľné)</label>
            <input className="input" disabled={locked} {...register('phone')} />
            <div className="helper">Ozveme sa vám iba ohľadom rezervácie.</div>
          </div>
        </div>

        <div className="row">
          <div>
            <label>Meno plavca</label>
            <input className="input" disabled={locked} {...register('studentName', { required: 'Meno plavca je povinné' })} />
            {errors.studentName && <div className="error">{errors.studentName.message}</div>}
          </div>
          <div>
            <label>Dátum narodenia</label>
            <input type="date" className="input" disabled={locked} {...register('studentDob', { required: 'Dátum narodenia je povinný' })} />
            {errors.studentDob && <div className="error">{errors.studentDob.message}</div>}
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

    <button className="button" disabled={locked}>{isSubmitting ? 'Odosielanie…' : (isSubmitSuccessful ? 'Odoslané' : 'Požiadať o lekcie')}</button>
    {isSubmitSuccessful && <div className="helper">Odpovieme do 1 pracovného dňa.</div>}
      </form>
    </div>
  )
}
