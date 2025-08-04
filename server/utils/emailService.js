import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to MultiVendor Platform',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to MultiVendor Platform</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${name},</h2>
          <p>Welcome to our platform! We're excited to have you on board.</p>
          <p>You can now start exploring our products and services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          </div>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  passwordReset: {
    subject: 'Reset your password',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${name},</h2>
          <p>You requested to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">\${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  emailVerification: {
    subject: 'Verify your email address',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Email Verification</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${name},</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">\${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  orderConfirmation: {
    subject: 'Order Confirmation - Order #\${orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmation</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${customerName},</h2>
          <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> \${orderNumber}</p>
            <p><strong>Order Date:</strong> \${orderDate}</p>
            <p><strong>Total Amount:</strong> \${totalAmount}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${orderUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
          <p>We'll send you updates as your order progresses.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  orderStatusUpdate: {
    subject: 'Order Status Update - Order #\${orderNumber}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Status Update</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${customerName},</h2>
          <p>Your order status has been updated.</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order Number:</strong> \${orderNumber}</p>
            <p><strong>New Status:</strong> \${newStatus}</p>
            <p><strong>Updated Date:</strong> \${updateDate}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${orderUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  vendorApproval: {
    subject: 'Vendor Application Approved',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Approved!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${contactName},</h2>
          <p>Congratulations! Your vendor application for <strong>\${businessName}</strong> has been approved.</p>
          <p>You can now start listing your products on our platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Dashboard</a>
          </div>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  vendorRejection: {
    subject: 'Vendor Application Status Update',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Status Update</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${contactName},</h2>
          <p>Thank you for your interest in becoming a vendor with <strong>\${businessName}</strong>.</p>
          <p>After careful review, we regret to inform you that your application has not been approved at this time.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Reason for Rejection:</h3>
            <p>\${rejectionReason}</p>
          </div>
          <p>You are welcome to reapply in the future with updated information.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  productApproval: {
    subject: 'Product Approved - \${productName}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Product Approved!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${vendorName},</h2>
          <p>Great news! Your product <strong>\${productName}</strong> has been approved and is now live on our platform.</p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Product Details:</h3>
            <p><strong>Product Name:</strong> \${productName}</p>
            <p><strong>Category:</strong> \${category}</p>
            <p><strong>Price:</strong> \${price}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product</a>
          </div>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  productRejection: {
    subject: 'Product Status Update - \${productName}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Product Status Update</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${vendorName},</h2>
          <p>Your product <strong>\${productName}</strong> requires attention.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Rejection Reason:</h3>
            <p>\${rejectionReason}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Update Product</a>
          </div>
          <p>Please review and update your product information accordingly.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

const replaceTemplateVariables = (template, data) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\\${${key}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
};

// Send email using Resend
export const sendEmail = async (options) => {
  if (!resend) {
    console.log('Email service not configured, skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MultiVendor Platform <noreply@multivendor.com>',
      to: options.email,
      subject: options.subject,
      html: options.html || options.message,
      text: options.text || options.message,
    });
    console.log('Email sent successfully via Resend:', result.data?.id);
    return result;
  } catch (error) {
    console.error('Resend email sending failed:', error);
    throw error;
  }
};

// Send template email
export const sendTemplateEmail = async (templateName, data, recipientEmail) => {
  if (!resend) {
    console.log('Email service not configured, skipping template email');
    return { success: false, message: 'Email service not configured' };
  }

  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  const html = replaceTemplateVariables(template.template, data);
  const subject = replaceTemplateVariables(template.subject, data);

  return await sendEmail({
    email: recipientEmail,
    subject,
    html
  });
};

// Send vendor approval email using Resend
export const sendVendorApprovalEmail = async (vendorData, feedback) => {
  if (!resend) {
    console.log('Email service not configured, skipping vendor approval email');
    return { success: false, message: 'Email service not configured' };
  }

  const template = emailTemplates.vendorApproval;
  const data = {
    contactName: vendorData.name,
    businessName: vendorData.businessName || vendorData.name,
    feedback: feedback || 'Welcome to our platform!'
  };

  const html = replaceTemplateVariables(template.template, data);
  const subject = replaceTemplateVariables(template.subject, data);

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MultiVendor Platform <noreply@multivendor.com>',
      to: vendorData.email,
      subject,
      html,
      tags: [
        { name: 'email_type', value: 'vendor_approval' },
        { name: 'vendor_id', value: vendorData._id?.toString() || 'unknown' }
      ]
    });
    console.log('Vendor approval email sent successfully via Resend:', result.data?.id);
    return result;
  } catch (error) {
    console.error('Resend vendor approval email failed:', error);
    throw error;
  }
};

// Send vendor rejection email using Resend
export const sendVendorRejectionEmail = async (vendorData, rejectionReason) => {
  if (!resend) {
    console.log('Email service not configured, skipping vendor rejection email');
    return { success: false, message: 'Email service not configured' };
  }

  const template = emailTemplates.vendorRejection;
  const data = {
    contactName: vendorData.name,
    businessName: vendorData.businessName || vendorData.name,
    rejectionReason: rejectionReason
  };

  const html = replaceTemplateVariables(template.template, data);
  const subject = replaceTemplateVariables(template.subject, data);

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MultiVendor Platform <noreply@multivendor.com>',
      to: vendorData.email,
      subject,
      html,
      tags: [
        { name: 'email_type', value: 'vendor_rejection' },
        { name: 'vendor_id', value: vendorData._id?.toString() || 'unknown' }
      ]
    });
    console.log('Vendor rejection email sent successfully via Resend:', result.data?.id);
    return result;
  } catch (error) {
    console.error('Resend vendor rejection email failed:', error);
    throw error;
  }
};

// Send bulk emails
export const sendBulkEmail = async (emails) => {
  if (!resend) {
    console.log('Email service not configured, skipping bulk email');
    return { success: false, message: 'Email service not configured' };
  }

  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, email: email.email, messageId: result.data?.id });
    } catch (error) {
      results.push({ success: false, email: email.email, error: error.message });
    }
  }
  
  return results;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  if (!resend) {
    console.log('Email service not configured');
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'MultiVendor Platform <noreply@multivendor.com>',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>This is a test email to verify Resend configuration.</p>'
    });
    console.log('Resend configuration is valid');
    return true;
  } catch (error) {
    console.error('Resend configuration error:', error);
    throw error;
  }
}; 