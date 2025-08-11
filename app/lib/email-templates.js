//lib/email-templates.js
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Template IDs 
const TEMPLATE_IDS = {
  MAGIC_LINK: 'd-45d77d46d00146779c1969eb5436d8be',
  BOOKING_CONFIRMATION: 'd-ca5a2dfa0453448b9a563675ee1cb133', 
  CONTACT_RESPONSE: 'd-5dd4773ceec8495cb74ba7009c567f9c',
  NEWSLETTER_WELCOME: 'd-bd11f216a28049a78ed10cc107574724',
  ADMIN_NOTIFICATION: 'd-ebc4731195094579906f24cf0d8d0c33',
  ADMIN_REPLY: 'd-ca5a2dfa0453448b9a563675ee1cb133',
  URGENT_MESSAGE: 'd-14c70aedf4bb408c8c31e4136fd62ad5'
}

// Email template functions
export const emailTemplates = {
  // 1. Magic Link Authentication Email
  async sendMagicLink({ email, url, firstName }) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.MAGIC_LINK,
      dynamicTemplateData: {
        firstName: firstName || 'User',
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

   // Admin Reply using Dynamic Template
  async sendAdminReply({
    recipientEmail,
    recipientName,
    replySubject,
    replyMessage,
    senderName,
    originalSubject,
    originalMessage
  }) {
    const msg = {
      to: recipientEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.ADMIN_REPLY,
      dynamicTemplateData: {
        // Recipient info
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        
        // Reply content
        reply_subject: replySubject,
        reply_message: replyMessage,
        sender_name: senderName || 'Dr. Ugwu - Gilt Counselling',
        
        // Original message context
        original_subject: originalSubject,
        original_message: originalMessage.length > 200 ? 
          originalMessage.substring(0, 200) + '...' : originalMessage,
        original_message_full: originalMessage,
        
        // Contact information
        office_phone: '+234 803 309 4050',
        office_email: 'wecare@giltcounselling.com',
        office_hours: 'Monday - Friday: 9:00 AM - 6:00 PM (WAT)',
        office_address: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria',
        
        // URLs
        booking_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking`,
        website_url: process.env.NEXT_PUBLIC_APP_URL,
        
        // Current date
        current_date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        
        // Company branding
        company_name: 'Gilt Counselling',
        company_tagline: 'Professional Mental Health Support'
      }
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Admin reply email error:', error)
      return { success: false, error: error.message }
    }
  },

  // Enhanced Admin Notification using Dynamic Template
  async sendAdminNotification({ type, data }) {
    if (type !== 'new_contact') {
      return { success: false, error: 'Unsupported notification type' }
    }

    const msg = {
      to: [
        process.env.ADMIN_EMAIL,
        process.env.SENDGRID_NOTIFICATION_EMAIL
      ].filter(Boolean),
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling System'
      },
      templateId: TEMPLATE_IDS.ADMIN_NOTIFICATION,
      dynamicTemplateData: {
        // Message details
        client_name: data.name,
        client_email: data.email,
        client_phone: data.phone || 'Not provided',
        message_subject: data.subject,
        message_content: data.message,
        message_urgency: data.urgency,
        
        // Urgency styling
        is_emergency: data.urgency === 'emergency',
        is_urgent: data.urgency === 'urgent',
        urgency_color: data.urgency === 'emergency' ? '#dc3545' : 
                      data.urgency === 'urgent' ? '#fd7e14' : '#28a745',
        urgency_label: data.urgency.toUpperCase(),
        
        // Timestamps
        received_date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        received_time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'Africa/Lagos'
        }),
        received_datetime: new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'Africa/Lagos'
        }),
        
        // Action URLs
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/messages`,
        quick_reply_url: `mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}`,
        call_url: data.phone ? `tel:${data.phone}` : '#',
        
        // Company info
        company_name: 'Gilt Counselling',
        admin_portal: 'Admin Dashboard'
      }
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Admin notification email error:', error)
      return { success: false, error: error.message }
    }
  },

  // Urgent Booking Message using Dynamic Template
  async sendUrgentBookingMessage({
    booking,
    urgentMessage,
  }) {
    const msg = {
      to: booking.userEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: TEMPLATE_IDS.URGENT_MESSAGE,
      dynamicTemplateData: {
        // Client info
        client_name: booking.userName,
        client_email: booking.userEmail,
        
        // Urgent message
        urgent_message: urgentMessage,
        
        // Appointment details
        service_type: booking.service,
        appointment_date: new Date(booking.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointment_time: booking.time,
        session_duration: booking.duration,
        booking_reference: booking.bookingReference || booking._id.toString().slice(-6),
        
        // Meeting info
        has_meeting_url: !!booking.meetingUrl,
        meeting_url: booking.meetingUrl || '#',
        meeting_id: booking.meetingId || 'TBD',
        
        // Contact details
        office_phone: '+234 803 309 4050',
        office_email: 'wecare@giltcounselling.com',
        office_hours: 'Monday - Friday, 9:00 AM - 6:00 PM (WAT)',
        office_address: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria',
        
        // Emergency info
        emergency_phone: '+234 803 309 4050',
        
        // Current timestamp
        current_date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        
        // Company branding
        company_name: 'Gilt Counselling',
        company_tagline: 'Professional Mental Health Support'
      }
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Urgent message email error:', error)
      return { success: false, error: error.message }
    }
  },

  // Contact Form Response using existing dynamic template
  async sendContactResponse({
    email,
    contactName,
    subject,
    priorityLevel = 'normal',
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
      }
    }

    try {
      await sgMail.send(msg)
      return { success: true }
    } catch (error) {
      console.error('Contact response email error:', error)
      return { success: false, error: error.message }
    }
  }
}