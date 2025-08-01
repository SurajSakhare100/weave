import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to MultiVendor Platform',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${name},</h2>
          <p>Welcome to MultiVendor Platform! We're excited to have you on board.</p>
          <p>Your account has been successfully created. You can now start shopping and exploring our wide range of products.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${loginUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a>
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
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> \${orderNumber}</p>
            <p><strong>Order Date:</strong> \${orderDate}</p>
            <p><strong>Total Amount:</strong> $\${totalAmount}</p>
            <p><strong>Payment Method:</strong> \${paymentMethod}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${orderUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </div>
          <p>You will receive updates about your order status via email.</p>
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
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> \${orderNumber}</p>
            <p><strong>New Status:</strong> <span style="color: #667eea; font-weight: bold;">\${newStatus}</span></p>
            <p><strong>Updated Date:</strong> \${updateDate}</p>
            \${#if trackingNumber}
            <p><strong>Tracking Number:</strong> \${trackingNumber}</p>
            \${/if}
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
    subject: 'Vendor Account Approved',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Account Approved!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${contactName},</h2>
          <p>Great news! Your vendor account for <strong>\${businessName}</strong> has been approved.</p>
          <p>You can now start listing your products and managing your store.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Dashboard</a>
          </div>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  
  vendorRejection: {
    subject: 'Vendor Account Application Update',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Application Update</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${contactName},</h2>
          <p>We have reviewed your vendor application for <strong>\${businessName}</strong>.</p>
          <p>Unfortunately, we are unable to approve your application at this time.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Reason:</strong> \${rejectionReason}</p>
          </div>
          <p>You can submit a new application with the required information or contact our support team for assistance.</p>
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
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Product Approved!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${vendorName},</h2>
          <p>Great news! Your product <strong>\${productName}</strong> has been approved and is now live on our platform.</p>
          <p>Your product is now visible to customers and can be purchased.</p>
          <div style="background: #d1fae5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Product Details:</strong></p>
            <p>Name: \${productName}</p>
            <p>Category: \${category}</p>
            <p>Price: \${price}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Product</a>
          </div>
          <p>Thank you for being part of our platform!</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  },
  
  productRejection: {
    subject: 'Product Update - \${productName}',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Product Update</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <h2>Hello \${vendorName},</h2>
          <p>We have reviewed your product submission <strong>\${productName}</strong>.</p>
          <p>Unfortunately, we are unable to approve this product at this time.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Reason:</strong> \${rejectionReason}</p>
          </div>
          <p>Please review the feedback and make the necessary changes. You can resubmit the product once the issues are resolved.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="\${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Edit Product</a>
          </div>
          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p>&copy; 2024 MultiVendor Platform. All rights reserved.</p>
        </div>
      </div>
    `
  }
};

// Replace template variables
const replaceTemplateVariables = (template, data) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\\${${key}}`, 'g');
    result = result.replace(regex, data[key]);
  });
  return result;
};

// Send email
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'MultiVendor Platform <noreply@multivendor.com>',
    to: options.email,
    subject: options.subject,
    html: options.html || options.message,
    text: options.text || options.message,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send template email
export const sendTemplateEmail = async (templateName, data, recipientEmail) => {
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

// Send bulk emails
export const sendBulkEmail = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, email: email.to, messageId: result.messageId });
    } catch (error) {
      results.push({ success: false, email: email.to, error: error.message });
    }
  }
  
  return results;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}; 