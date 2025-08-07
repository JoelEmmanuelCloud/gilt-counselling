//lib/email-templates.js
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Template IDs 
const TEMPLATE_IDS = {
  MAGIC_LINK: 'd-45d77d46d00146779c1969eb5436d8be',
  BOOKING_CONFIRMATION: 'd-ca5a2dfa0453448b9a563675ee1cb133', 
  CONTACT_RESPONSE: 'd-5dd4773ceec8495cb74ba7009c567f9c',
  NEWSLETTER_WELCOME: 'd-bd11f216a28049a78ed10cc107574724',
}

// Email template functions
export const emailTemplates = {
  // 1. Magic Link Authentication Email
  async sendMagicLink({ email, url, name = 'User' }) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.MAGIC_LINK,
      dynamicTemplateData: {
        name,
        email,
        url,
        unsubscribe: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      },
    }

    try {
      await sgMail.send(msg)

      return { success: true }
    } catch (error) {
      console.error('Magic link email error:', error)
      return { success: false, error: error.message }
    }
  },

  // 2. Booking Confirmation Email
  async sendBookingConfirmation({
    email,
    clientName,
    serviceType,
    appointmentDate,
    appointmentTime,
    sessionDuration,
    sessionFee,
    bookingStatus = 'Pending Confirmation',
    notes = null
  }) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.BOOKING_CONFIRMATION,
      dynamicTemplateData: {
        client_name: clientName,
        service_type: serviceType,
        appointment_date: new Date(appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointment_time: appointmentTime,
        session_duration: sessionDuration,
        session_fee: sessionFee,
        booking_status: bookingStatus,
        notes: notes,
      },
    }

    try {
      await sgMail.send(msg)

      return { success: true }
    } catch (error) {
      console.error('Booking confirmation email error:', error)
      return { success: false, error: error.message }
    }
  },

  // 3. Contact Form Response Email
  async sendContactResponse({
    email,
    contactName,
    subject,
    priorityLevel = 'Normal',
    phone = null,
    isUrgent = false
  }) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.CONTACT_RESPONSE,
      dynamicTemplateData: {
        contact_name: contactName,
        contact_email: email,
        subject,
        priority_level: priorityLevel,
        phone,
        is_urgent: isUrgent,
        submission_date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        unsubscribe: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      },
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Contact response email error:', error)
      return { success: false, error: error.message }
    }
  },

  // 4. Newsletter Welcome Email
  async sendNewsletterWelcome({
    email,
    subscriberName = 'Friend'
  }) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.NEWSLETTER_WELCOME,
      dynamicTemplateData: {
        subscriber_name: subscriberName,
        preferences_url: `${process.env.NEXTAUTH_URL}/newsletter/preferences?email=${encodeURIComponent(email)}`,
        unsubscribe: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      },
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Newsletter welcome email error:', error)
      return { success: false, error: error.message }
    }
  },

  // Admin Notification Email (using simple HTML, not template)
  async sendAdminNotification({
    type,
    data
  }) {
    let subject, htmlContent

    switch (type) {
      case 'new_contact':
        subject = `New Contact Form Message: ${data.subject}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1>New Contact Form Submission</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #00303F; margin-top: 0;">Contact Details</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
                <p><strong>Priority:</strong> ${data.urgency.toUpperCase()}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00303F; margin-top: 0;">Message</h3>
                <p style="white-space: pre-wrap;">${data.message}</p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #666;">Submitted on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        `
        break

      case 'new_booking':
        subject = `New Booking Request: ${data.service}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1>New Booking Request</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #00303F; margin-top: 0;">Booking Details</h2>
                <p><strong>Client:</strong> ${data.userName} (${data.userEmail})</p>
                <p><strong>Service:</strong> ${data.service}</p>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${data.time}</p>
                ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        `
        break

      default:
        return { success: false, error: 'Unknown notification type' }
    }

    const msg = {
      to: process.env.SENDGRID_NOTIFICATION_EMAIL,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling System'
      },
      subject,
      html: htmlContent,
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Admin notification email error:', error)
      return { success: false, error: error.message }
    }
  }
}