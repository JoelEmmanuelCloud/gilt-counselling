// lib/enhanced-email-templates.js
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const enhancedEmailTemplates = {
  // Enhanced admin notification with better formatting
  async sendAdminNotification({ type, data }) {
    let subject, htmlContent

    switch (type) {
      case 'new_contact':
        subject = `🔔 New Contact Message: ${data.subject}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">New Contact Message</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Gilt Counselling Admin Dashboard</p>
            </div>
            
            <!-- Urgent Banner -->
            ${data.urgency === 'emergency' || data.urgency === 'urgent' ? `
            <div style="background: ${data.urgency === 'emergency' ? '#dc3545' : '#fd7e14'}; color: white; padding: 15px; text-align: center; font-weight: bold;">
              🚨 ${data.urgency.toUpperCase()} PRIORITY MESSAGE
            </div>
            ` : ''}
            
            <!-- Main Content -->
            <div style="padding: 30px 20px; background: #f8f9fa;">
              <!-- Contact Details Card -->
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #00303F; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                  Contact Information
                </h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #495057;">👤 Name:</p>
                    <p style="margin: 0; color: #00303F; font-size: 16px;">${data.name}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #495057;">✉️ Email:</p>
                    <p style="margin: 0; color: #00303F;"><a href="mailto:${data.email}" style="color: #D4AF37; text-decoration: none;">${data.email}</a></p>
                  </div>
                  ${data.phone ? `
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #495057;">📞 Phone:</p>
                    <p style="margin: 0; color: #00303F;"><a href="tel:${data.phone}" style="color: #D4AF37; text-decoration: none;">${data.phone}</a></p>
                  </div>
                  ` : ''}
                  <div>
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #495057;">⚠️ Priority:</p>
                    <span style="background: ${
                      data.urgency === 'emergency' ? '#dc3545' : 
                      data.urgency === 'urgent' ? '#fd7e14' : '#28a745'
                    }; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                      ${data.urgency}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #495057;">📋 Subject:</p>
                  <p style="margin: 0; color: #00303F; font-size: 16px; font-weight: 500;">${data.subject}</p>
                </div>
              </div>
              
              <!-- Message Card -->
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #00303F; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                  Message Content
                </h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #D4AF37;">
                  <p style="margin: 0; color: #495057; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div style="background: white; padding: 25px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #00303F; margin: 0 0 20px 0;">Quick Actions</h3>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages" 
                     style="background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    📧 Reply in Dashboard
                  </a>
                  <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" 
                     style="background: #6c757d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    ↩️ Quick Email Reply
                  </a>
                  <a href="tel:${data.phone || ''}" 
                     style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    📞 Call Client
                  </a>
                </div>
              </div>
              
              <!-- Timestamp -->
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                  📅 Received on ${new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'Africa/Lagos'
                  })} (WAT)
                </p>
              </div>
            </div>
          </div>
        `
        break

      default:
        return { success: false, error: 'Unknown notification type' }
    }

    const msg = {
      to: [
        process.env.ADMIN_EMAIL,
        process.env.SENDGRID_NOTIFICATION_EMAIL
      ].filter(Boolean), // Remove any undefined emails
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