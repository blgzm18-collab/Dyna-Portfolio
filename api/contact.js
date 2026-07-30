// api/contact.js
// Vercel serverless function to handle chat form submissions

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
    return res.status(400).json({ success: false, error: 'Invalid email' });
  }

  try {
    // Option 1: Send email via Resend (recommended)
    // You'll need to: npm install resend
    // Then add RESEND_API_KEY to your Vercel environment variables
    
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'from: 'onboarding@resend.dev', // Resend sandbox (works immediately)', // Change to your domain
      to: 'dynamexed@gmail.com', // Where you want to receive messages
      replyTo: email,
      subject: `New message from ${name} via Dynabot`,
      html: `
        <h2>New contact from Dynabot</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}
