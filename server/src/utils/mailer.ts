import dotenv from 'dotenv'
dotenv.config()

const RESEND_API_KEY = process.env.RESEND_API_KEY
const MAIL_FROM = process.env.MAIL_FROM || 'Naenra <onboarding@resend.dev>'

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [email],
      subject: 'Your ARENA.ENG Verification Code',
      html: `
        <div style="background:#10131a;padding:40px;font-family:monospace;color:#e1e2eb;border-radius:12px;max-width:400px;margin:0 auto">
          <h1 style="color:#7df4ff;letter-spacing:4px;text-align:center">ARENA.ENG</h1>
          <p style="text-align:center;color:#b9cacb">Your verification code:</p>
          <div style="background:#1d2026;border:1px solid #3b494b;border-radius:8px;padding:24px;text-align:center;margin:20px 0">
            <span style="color:#7df4ff;font-size:36px;font-weight:bold;letter-spacing:12px">${otp}</span>
          </div>
          <p style="color:#b9cacb;font-size:12px;text-align:center">
            This code expires in <strong style="color:#ffb4ab">10 minutes</strong>.
          </p>
          <p style="color:#3b494b;font-size:11px;text-align:center">
            If you did not register, ignore this email.
          </p>
        </div>
      `
    })
  })

  if (!res.ok) {
    const errorBody = await res.text()
    console.error('Resend API error:', res.status, errorBody)
    throw new Error('Failed to send OTP email')
  }
}