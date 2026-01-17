/**
 * Test Resend SMTP connection directly
 * Run with: node scripts/test-resend-smtp.js
 *
 * Requires: RESEND_API_KEY environment variable
 */

const nodemailer = require('nodemailer');

async function testResendSMTP() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('❌ RESEND_API_KEY environment variable is not set');
    console.log('\nSet it with: export RESEND_API_KEY=re_your_key_here');
    process.exit(1);
  }

  console.log('🔍 Testing Resend SMTP connection...\n');
  console.log('API Key prefix:', apiKey.substring(0, 10) + '...');

  const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // true for port 465
    auth: {
      user: 'resend',
      pass: apiKey,
    },
  });

  try {
    // Verify connection
    console.log('\n📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log(`📧 Sending test email to ${testEmail}...`);
      const info = await transporter.sendMail({
        from: 'Cortex <noreply@cortex.vip>',
        to: testEmail,
        subject: 'Resend SMTP Test - Cortex',
        html: `
          <h1>SMTP Test Successful!</h1>
          <p>If you're seeing this, Resend SMTP is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
      });
      console.log('✅ Test email sent!');
      console.log('Message ID:', info.messageId);
    } else {
      console.log('💡 To send a test email, run:');
      console.log('   node scripts/test-resend-smtp.js your@email.com');
    }
  } catch (error) {
    console.error('\n❌ SMTP Error:', error.message);

    if (error.code === 'EAUTH') {
      console.log('\n🔑 Authentication failed. Check your RESEND_API_KEY.');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Connection failed. Check your network or firewall.');
    } else if (error.message.includes('Domain not verified')) {
      console.log('\n🌐 Domain not verified. Check Resend dashboard.');
    }

    console.log('\nFull error:', error);
    process.exit(1);
  }
}

testResendSMTP();
