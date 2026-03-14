import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend free plan: use onboarding@resend.dev until your domain is verified
const FROM_EMAIL = process.env.FROM_EMAIL ?? 'onboarding@resend.dev'
const APP_NAME = 'Crypto Reporter'

export async function sendPasswordEmail(
  to: string,
  password: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to,
    subject: `Ваш пароль для ${APP_NAME}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1d4ed8;">Добро пожаловать в ${APP_NAME}</h2>
        <p>Ваш аккаунт создан. Используйте эти данные для входа:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0;"><strong>Пароль:</strong>
            <span style="font-family: monospace; font-size: 1.1em; color: #1d4ed8;">${password}</span>
          </p>
        </div>
        <p style="color: #64748b; font-size: 0.875em;">
          Рекомендуем сохранить пароль в надёжном месте.
        </p>
      </div>
    `,
  })

  if (error) throw new Error(`Email send failed: ${error.message}`)
}
