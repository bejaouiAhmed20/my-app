import nodemailer from 'nodemailer';
import { createError } from '../middlewares/errorHandler';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: any;
}

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (template: string, data: any): { html: string; text: string } => {
  switch (template) {
    case 'welcome':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to ProjectDemandHub!</h1>
            <p>Hi ${data.name},</p>
            <p>Welcome to ProjectDemandHub! We're excited to have you on board as a ${data.role}.</p>
            <p>You can now:</p>
            <ul>
              ${data.role === 'client' 
                ? '<li>Submit project demands</li><li>Track your project status</li><li>Chat with our admin team</li>' 
                : '<li>Manage client demands</li><li>Negotiate project prices</li><li>Communicate with clients</li>'
              }
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The ProjectDemandHub Team</p>
          </div>
        `,
        text: `Welcome to ProjectDemandHub! Hi ${data.name}, welcome to ProjectDemandHub as a ${data.role}. If you have any questions, feel free to reach out to our support team.`
      };

    case 'password-reset':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            <p>Hi ${data.name},</p>
            <p>You requested a password reset for your ProjectDemandHub account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 10 minutes for security reasons.</p>
            <p>Best regards,<br>The ProjectDemandHub Team</p>
          </div>
        `,
        text: `Password Reset Request. Hi ${data.name}, you requested a password reset. Visit: ${data.resetUrl} (expires in 10 minutes)`
      };

    case 'demand-status-update':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Demand Status Update</h1>
            <p>Hi ${data.clientName},</p>
            <p>Your project demand "<strong>${data.demandTitle}</strong>" has been updated.</p>
            <p><strong>New Status:</strong> ${data.status}</p>
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
            ${data.negotiatedPrice ? `<p><strong>Negotiated Price:</strong> $${data.negotiatedPrice}</p>` : ''}
            <p>You can view the full details and respond in your dashboard.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Dashboard</a>
            </div>
            <p>Best regards,<br>The ProjectDemandHub Team</p>
          </div>
        `,
        text: `Demand Status Update. Hi ${data.clientName}, your project "${data.demandTitle}" status: ${data.status}. ${data.message || ''}`
      };

    case 'new-demand-notification':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">New Project Demand</h1>
            <p>Hi Admin,</p>
            <p>A new project demand has been submitted by ${data.clientName}.</p>
            <p><strong>Project Title:</strong> ${data.demandTitle}</p>
            <p><strong>Project Type:</strong> ${data.projectType}</p>
            <p><strong>Budget:</strong> $${data.budget}</p>
            <p><strong>Deadline:</strong> ${data.deadline}</p>
            <p>Please review and respond to this demand in the admin dashboard.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/admin/demands" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Demand</a>
            </div>
            <p>Best regards,<br>The ProjectDemandHub System</p>
          </div>
        `,
        text: `New Project Demand from ${data.clientName}. Title: ${data.demandTitle}, Budget: $${data.budget}`
      };

    case 'chat-message':
      return {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">New Message</h1>
            <p>Hi ${data.recipientName},</p>
            <p>You have a new message regarding project "<strong>${data.demandTitle}</strong>".</p>
            <p><strong>From:</strong> ${data.senderName}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              ${data.message}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/chat/${data.chatId}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply</a>
            </div>
            <p>Best regards,<br>The ProjectDemandHub Team</p>
          </div>
        `,
        text: `New message from ${data.senderName} about "${data.demandTitle}": ${data.message}`
      };

    default:
      throw createError('Email template not found', 500);
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    const { html, text } = getEmailTemplate(options.template, options.data);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw createError('Failed to send email', 500);
  }
};

export const sendBulkEmail = async (recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void> => {
  try {
    const emailPromises = recipients.map(recipient => 
      sendEmail({ ...options, to: recipient })
    );
    
    await Promise.all(emailPromises);
    console.log(`Bulk email sent to ${recipients.length} recipients`);
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw createError('Failed to send bulk email', 500);
  }
};
