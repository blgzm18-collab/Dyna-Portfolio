// api/contact.js
// Vercel serverless function with better error handling

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, name, message } = req.body;

  // Validate inputs
  if (!email || !name || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  // Check if RESEND_API_KEY is set
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Missing API key' 
    });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'dynamexed@gmail.com',
      replyTo: email,
      subject: `New message from ${name} via Dynabot`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📬 New contact from Dynabot</h2>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          
          <h3>Message:</h3>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">
            Reply-To: ${escapeHtml(email)}
          </p>
        </div>
      `,
    });

    if (emailResult.error) {
      console.error('Resend error:', emailResult.error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email: ' + emailResult.error.message 
      });
    }

    console.log('Email sent successfully:', emailResult.data.id);
    return res.status(200).json({ success: true, messageId: emailResult.data.id });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error: ' + (error.message || 'Unknown error') 
    });
  }
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
