import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'

type CampForm = {
  parentName: string
  email: string
  camperName: string
  camperDob: string
  week: string
  notes?: string
}

export default function SummerCamp(){
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<CampForm>()
  const locked = isSubmitting || isSubmitSuccessful

  const onSubmit = async (data: CampForm) => {
  const { error } = await supabase
      .from('camp_registrations')
      .insert({
        parent_name: data.parentName,
        email: data.email,
        camper_name: data.camperName,
        camper_dob: data.camperDob,
        preferred_week: data.week,
        notes: data.notes ?? null,
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
          text: `Dobrý deň,\n\nĎakujeme za žiadosť o miesto v letnom tábore pre ${data.camperName}. Ozveme sa vám do 1 pracovného dňa.\n\nTím SwimShark`,
          html: `<p>Dobrý deň,</p><p>Ďakujeme za žiadosť o miesto v letnom tábore pre <b>${data.camperName}</b>. Ozveme sa vám do 1 pracovného dňa.</p><p>Tím SwimShark</p>`
        })
      })
    } catch (e) {
      console.warn('Email send failed', e)
    }
    alert(`Žiadosť o tábor pre ${data.camperName} bola prijatá. Ozveme sa!`)
  }

  return (
    <div className="section">
  <h1>Letný tábor</h1>
      <p className="muted">Týždňové tábory plné zábavy, bezpečnosti a rozvoja zručností.</p>

  <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={isSubmitting}>
        <div className="row">
          <div>
            <label>Meno rodiča/zákonného zástupcu</label>
    <input className="input" disabled={locked} {...register('parentName', { required: 'Meno je povinné' })} />
            {errors.parentName && <div className="error">{errors.parentName.message}</div>}
          </div>
          <div>
            <label>Email</label>
    <input type="email" className="input" disabled={locked} {...register('email', { required: 'Email je povinný' })} />
            {errors.email && <div className="error">{errors.email.message}</div>}
          </div>
        </div>

        <div className="row">
          <div>
            <label>Meno účastníka</label>
            <input className="input" disabled={locked} {...register('camperName', { required: 'Meno účastníka je povinné' })} />
            {errors.camperName && <div className="error">{errors.camperName.message}</div>}
          </div>
          <div>
            <label>Dátum narodenia</label>
            <input type="date" className="input" disabled={locked} {...register('camperDob', { 
              required: 'Dátum narodenia je povinný',
              validate: (value) => {
                const dob = new Date(value)
                const today = new Date()
                const age = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
                return age >= 4 || 'Vek účastníka musí byť aspoň 4 roky'
              }
            })} />
            {errors.camperDob && <div className="error">{errors.camperDob.message as string}</div>}
          </div>
        </div>

        <div className="row">
          <div>
            <label>Preferovaný týždeň</label>
      <select className="select" disabled={locked} {...register('week', { required: 'Zvoľte týždeň' })}>
              <option value="">Vyberte týždeň</option>
              <option>9.–13. jún</option>
              <option>16.–20. jún</option>
              <option>23.–27. jún</option>
              <option>7.–11. júl</option>
              <option>14.–18. júl</option>
            </select>
            {errors.week && <div className="error">{errors.week.message}</div>}
          </div>
          <div>
            <label>Poznámky (voliteľné)</label>
      <textarea className="textarea" rows={4} placeholder="Alergie, skúsenosti s plávaním, prosby o kamarátov" disabled={locked} {...register('notes')}/>
          </div>
        </div>

    <button className="button" disabled={locked}>{isSubmitting ? 'Odosielanie…' : (isSubmitSuccessful ? 'Odoslané' : 'Požiadať o miesto v tábore')}</button>
        {isSubmitSuccessful && <div className="helper">Odpovieme do 1 pracovného dňa.</div>}
      </form>
    </div>
  )
}
