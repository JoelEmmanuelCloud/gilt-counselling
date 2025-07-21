//lib/sendgrid.js
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async (to, subject, html, text = null) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error: error.message }
  }
}

export const sendBulkEmail = async (messages) => {
  try {
    await sgMail.send(messages)
    return { success: true }
  } catch (error) {
    console.error('SendGrid bulk email error:', error)
    return { success: false, error: error.message }
  }
}