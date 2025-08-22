import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 5179

app.use(cors())
app.use(express.json())

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const fromEmail = process.env.MAIL_FROM || smtpUser

if (!smtpHost || !smtpUser || !smtpPass) {
  console.warn('SMTP env missing: SMTP_HOST, SMTP_USER, SMTP_PASS must be set')
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPass },
})

app.post('/api/send-confirmation', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body as { to: string, subject: string, text?: string, html?: string }
    if (!to || !subject) return res.status(400).json({ error: 'Missing to/subject' })
    const info = await transporter.sendMail({ from: fromEmail, to, subject, text, html })
    res.json({ ok: true, id: info.messageId })
  } catch (e: any) {
    console.error('send-confirmation error', e)
    res.status(500).json({ error: e?.message || 'Failed to send email' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(port, () => {
  console.log(`Mail API listening on http://localhost:${port}`)
})
