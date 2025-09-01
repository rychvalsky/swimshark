import { useForm, useFieldArray } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type CampForm = {
  parentName: string
  email: string
  parentPhone: string
  childrenCount: number
  children: { name: string; dob: string; size: string }[]
  week: string
  notes?: string
  gdpr: boolean
  docUrl?: string
}

export default function SummerCamp(){
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<CampForm>({
    defaultValues: {
      childrenCount: 1,
  children: [{ name: '', dob: '', size: '' }],
      gdpr: false,
    }
  })
  const { fields, replace } = useFieldArray({ control, name: 'children' })
  const locked = isSubmitting || isSubmitSuccessful
  const [showGdpr, setShowGdpr] = useState(false)
  const [turnuses, setTurnuses] = useState<{ label: string; start_date: string | null; end_date: string | null; is_full?: boolean }[]>([])

  useEffect(() => {
    supabase.from('camp_turnuses').select('*').order('position', { ascending: true }).then(({ data }) => {
      const list = (data as any[] || []).map(r => ({ label: r.label ?? 'Turnus', start_date: r.start_date ?? null, end_date: r.end_date ?? null, is_full: r.is_full ?? false }))
      setTurnuses(list)
    })
  }, [])

  const onSubmit = async (data: CampForm) => {
  const campers = (data.children || [])
      .filter(c => c && c.name && c.dob && c.size)
      .map(c => ({ name: c.name, dob: c.dob, size: c.size }))
  const first = campers[0] || { name: '', dob: '' }
  let { error } = await supabase
      .from('camp_registrations')
      .insert({
        parent_name: data.parentName,
        email: data.email,
        parent_phone: data.parentPhone,
        camper_name: first.name, // legacy back-compat
        camper_dob: first.dob || null, // legacy back-compat
        campers,
        preferred_week: data.week,
  t_shirt_size: (first as any).size || null,
        notes: data.notes ?? null,
        submitted_at: new Date().toISOString(),
      })
    if (error) {
      // Backward-compatible retry if DB doesn't have parent_phone yet
      if ((error.message || '').toLowerCase().includes('parent_phone')){
        const mergedNotes = [data.notes?.trim(), `Telefón rodiča: ${data.parentPhone}`].filter(Boolean).join('\n')
        const retry = await supabase
          .from('camp_registrations')
          .insert({
            parent_name: data.parentName,
            email: data.email,
            camper_name: first.name,
            camper_dob: first.dob || null,
            campers,
            preferred_week: data.week,
            t_shirt_size: (first as any).size || null,
            notes: mergedNotes || null,
            submitted_at: new Date().toISOString(),
          })
        if (retry.error){
          alert(`Nepodarilo sa odoslať formulár: ${retry.error.message}`)
          return
        }
      } else {
        alert(`Nepodarilo sa odoslať formulár: ${error.message}`)
        return
      }
    }
    try {
      // Optional: fetch and attach a Word document
      let attachment: any = null
      const url = (data.docUrl || '').trim()
      if (url) {
        try {
          const res = await fetch(url)
          if (res.ok) {
            const blob = await res.blob()
            const arr = new Uint8Array(await blob.arrayBuffer())
            let binary = ''
            for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i])
            const b64 = btoa(binary)
            const fname = url.split('/').pop() || 'dokument.docx'
            const ctype = blob.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            attachment = { filename: fname, content_base64: b64, content_type: ctype }
          }
        } catch {}
      }
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          subject: 'Potvrdenie žiadosti – SwimShark',
          text: `Dobrý deň,\n\nĎakujeme za žiadosť o miesto v letnom tábore. Ozveme sa vám do 1 pracovného dňa.\n\nZhrnutie:\n- Týždeň: ${data.week}\n- Deti: ${campers.map(c => `${c.name} (${c.dob}, tričko: ${c.size})`).join(', ')}\n- Telefón: ${data.parentPhone}\n\nTím SwimShark`,
          html: `<p>Dobrý deň,</p><p>Ďakujeme za žiadosť o miesto v letnom tábore. Ozveme sa vám do 1 pracovného dňa.</p><p><strong>Zhrnutie:</strong><br/>Týždeň: ${data.week}<br/>Deti: ${campers.map(c => `${c.name} (${c.dob}, tričko: ${c.size})`).join(', ')}<br/>Telefón: ${data.parentPhone}</p><p>Tím SwimShark</p>`,
          attachment
        })
      })
    } catch (e) {
      console.warn('Email send failed', e)
    }
    alert(`Žiadosť o tábor bola prijatá. Ozveme sa!`)
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
            <label>Telefón rodiča</label>
            <input type="tel" className="input" disabled={locked} {...register('parentPhone', { required: 'Telefón je povinný' })} />
            {errors.parentPhone && <div className="error">{errors.parentPhone.message}</div>}
          </div>
          <div>
            <label>Odkaz na dokument (Word) – voliteľné</label>
            <input type="url" className="input" placeholder="https://…/subor.docx" disabled={locked} {...register('docUrl')} />
          </div>
        </div>

        <div className="row">
          <div>
            <label>Počet detí</label>
            <select
              className="select"
              disabled={locked}
              {...register('childrenCount', { required: true, valueAsNumber: true, min: 1, max: 5 })}
              onChange={(e) => {
                const n = Math.max(1, Math.min(5, parseInt(e.target.value || '1', 10)))
                const current = watch('children') || []
                const next = Array.from({ length: n }, (_, i) => current[i] || { name: '', dob: '', size: '' })
                setValue('childrenCount', n)
                replace(next)
              }}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {fields.map((field, idx) => (
          <div className="row" key={field.id}>
            <div>
              <label>Meno účastníka {idx + 1}</label>
              <input
                className="input"
                disabled={locked}
                {...register(`children.${idx}.name` as const, { required: 'Meno účastníka je povinné' })}
              />
              {errors.children?.[idx]?.name && <div className="error">{(errors.children[idx] as any)?.name?.message}</div>}
            </div>
            <div>
              <label>Dátum narodenia {idx + 1}</label>
              <input
                type="date"
                className="input"
                disabled={locked}
                {...register(`children.${idx}.dob` as const, {
                  required: 'Dátum narodenia je povinný',
                  validate: (value) => {
                    const dob = new Date(value)
                    const today = new Date()
                    const age = today.getFullYear() - dob.getFullYear() - (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
                    return age >= 4 || 'Vek účastníka musí byť aspoň 4 roky'
                  }
                })}
              />
              {errors.children?.[idx]?.dob && <div className="error">{(errors.children[idx] as any)?.dob?.message}</div>}
            </div>
            <div>
              <label>Veľkosť trička {idx + 1}</label>
              <select
                className="select"
                disabled={locked}
                {...register(`children.${idx}.size` as const, { required: 'Zvoľte veľkosť' })}
              >
                <option value="">Vyberte veľkosť</option>
                <option>110</option>
                <option>122</option>
                <option>134</option>
                <option>146</option>
                <option>158</option>
                <option>Damske S (164 cm)</option>
              </select>
              {errors.children?.[idx]?.size && <div className="error">{(errors.children[idx] as any)?.size?.message}</div>}
            </div>
          </div>
        ))}

        <div className="row">
          <div>
            <label>Preferovaný turnus</label>
            <select className="select" disabled={locked} {...register('week', { required: 'Zvoľte turnus' })}>
              <option value="">Vyberte turnus</option>
              {turnuses.map((t, i) => (
                <option key={i} value={`${t.label} (${formatDate(t.start_date)} – ${formatDate(t.end_date)})`} disabled={t.is_full}>
                  {t.label} — {formatDate(t.start_date)} – {formatDate(t.end_date)} {t.is_full ? '(obsadené)' : ''}
                </option>
              ))}
            </select>
            {errors.week && <div className="error">{errors.week.message}</div>}
          </div>
          <div>
            <label>Poznámky (voliteľné)</label>
      <textarea className="textarea" rows={4} placeholder="Alergie, skúsenosti s plávaním, prosby o kamarátov" disabled={locked} {...register('notes')}/>
          </div>
        </div>

        <div>
          <label className="checkbox">
            <input type="checkbox" disabled={locked} {...register('gdpr', { required: 'Pred odoslaním musíte súhlasiť so spracúvaním osobných údajov' })} />
            <span>
              Súhlasím so spracúvaním osobných údajov (<button type="button" className="link-button" onClick={() => setShowGdpr(true)}>zobraziť úplné znenie</button>)
            </span>
          </label>
          {errors.gdpr && <div className="error">{errors.gdpr.message as string}</div>}
        </div>

        <button className="button" disabled={locked}>{isSubmitting ? 'Odosielanie…' : (isSubmitSuccessful ? 'Odoslané' : 'Požiadať o miesto v tábore')}</button>
        {isSubmitSuccessful && <div className="helper">Odpovieme do 1 pracovného dňa.</div>}
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

function formatDate(iso: string | null){
  if (!iso) return ''
  try{
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch {
    return iso as any
  }
}
