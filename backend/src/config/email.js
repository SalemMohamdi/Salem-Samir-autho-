import nodemailer from 'nodemailer';

// Single transporter instance with proper async handling
let transporter;

const initializeTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Development: Use ethereal.email
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

// Mock transporter for testing
const mockTransporter = {
  sendMail: (mailOptions) => {
    console.log('📨 Email Mock:', mailOptions);
    return Promise.resolve({ messageId: 'mocked-id' });
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    // Initialize transporter if not exists
    if (!transporter && process.env.NODE_ENV !== 'test') {
      transporter = await initializeTransporter();
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 10px 20px; background: #2563eb; 
                  color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; color: #6b7280;">
          Link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `
    };

    if (process.env.NODE_ENV === 'test') {
      return mockTransporter.sendMail(mailOptions);
    }

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send password reset email');
  }
};