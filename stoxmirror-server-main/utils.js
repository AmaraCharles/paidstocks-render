const bcrypt = require("bcryptjs");
const axios = require("axios");
const nodemailer = require("nodemailer");
const speakeasy = require('speakeasy');

const salt = bcrypt.genSaltSync(10);
const secret = speakeasy.generateSecret({ length: 4 });

// ----------------------
// Utility Functions
// ----------------------
const hashPassword = (password) => bcrypt.hashSync(password, salt);
const compareHashedPassword = (hashedPassword, password) =>
  bcrypt.compareSync(password, hashedPassword);

// ----------------------
// Email Template Builder
// ----------------------
const buildEmailTemplate = ({ title, bodyHtml }) => `
<html>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#fff;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#FD7E14; padding:20px;">
                <img src="cid:logo" alt="Logo" width="150" style="display:block;">
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333;">
                <h2 style="color:#FD7E14; margin-top:0;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px; text-align:center; font-size:12px; color:#888; background:#f7f7f7;">
                Paidstocks Team<br>
                &copy; ${new Date().getFullYear()} Paidstocks. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// ----------------------
// Mail Transporter
// ----------------------
const createTransporter = () => nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ----------------------
// Generic sendEmail
// ----------------------
const sendEmail = async ({ to, subject, title, bodyHtml }) => {
  const transporter = createTransporter();
  const html = buildEmailTemplate({ title, bodyHtml });

  const info = await transporter.sendMail({
    from: `${process.env.EMAIL_USER}`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo.png',
        path: './logo.png',
        cid: 'logo',
      },
    ],
  });

  console.log("Message sent: %s", info.messageId);
};

// ----------------------
// Main Emails
// ----------------------
const sendWelcomeEmail = async ({ to,otp }) => {
  await sendEmail({
    to,
    subject: "Welcome to Paidstocks",
    title: "Welcome to Paidstocks",
    bodyHtml: `
      <p>Hi there,</p>
      <p>We’re excited to have you on board! Confirm your email to secure your account.</p>
      <p style="font-size:18px; font-weight:bold;">Your OTP: ${otp }</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  });
};

const resendWelcomeEmail = sendWelcomeEmail;

const sendPasswordOtp = async ({ to,otp}) => {
  await sendEmail({
    to: to,
    subject: "Password Reset",
    title: "Password Reset Request",
    bodyHtml: `
      <p>Dear esteemed user,</p>
      <p>We received a request to reset your password.</p>
      <p style="font-size:18px; font-weight:bold;">Your OTP: ${otp}</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

const resetEmail = async ({ to }) => {
  await sendEmail({
    to,
    subject: "Change Password",
    title: "Change Password Request",
    bodyHtml: `
      <p>You have requested to change your password.</p>
      <p style="font-size:18px; font-weight:bold;">Your OTP: ${speakeasy.totp({ secret: secret.base32, encoding: 'base32' })}</p>
      <p>If you did not request this, contact our support immediately.</p>
    `,
  });
};

const sendVerificationEmail = async ({ from, url }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "Account Verification Notification",
    title: "Account Verification",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>${from} just verified their Paidstocks account.</p>
      <p>Click <a href="${url}">here</a> to view the document.</p>
    `,
  });
};

const sendDepositEmail = async ({ from, amount, method, timestamp }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "Deposit Notification",
    title: "Deposit Notification",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>${from} just sent $${amount} via ${method}. Please confirm the transaction and update their balance.</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendDepositApproval = async ({ from, to, amount, method, timestamp }) => {
  await sendEmail({
    to,
    subject: "Deposit Approved",
    title: "Deposit Approval",
    bodyHtml: `
      <p>Hello ${from},</p>
      <p>Your deposit of $${amount} via ${method} has been approved.</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendBankDepositRequestEmail = async ({ from, amount, method, timestamp }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "Bank Deposit Request",
    title: "Bank Deposit Request",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>${from} has sent a bank transfer request for $${amount} via ${method}. Please provide account details.</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};
const userRegisteration = async ({  firstName,email}) => {
  
  let transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: `${process.env.EMAIL_USER}`, // sender address
    to: "support@Paidstocks.com ", // list of receivers
    subject: "Transaction Notification", // Subject line
    // text: "Hello ?", // plain text body
    html: `

    <html>
    <p>Hello Chief</p>

    <p>${firstName} with email ${email} just signed up.Please visit your dashboard for confirmation.
    </p>

    <p>Best wishes,</p>
    <p>Paidstocks Team</p>

    </html>
    
    `, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

const sendWithdrawalRequestEmail = async ({ from, amount, method, address }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "Withdrawal Request",
    title: "Withdrawal Request Notification",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>${from} wants to withdraw $${amount} via ${method} to ${address} wallet address.</p>
    `,
  });
};

const sendWithdrawalEmail = async ({ to, from, amount, method, address, timestamp }) => {
  await sendEmail({
    to,
    subject: "Withdrawal Confirmation",
    title: "Withdrawal Confirmation",
    bodyHtml: `
      <p>Hello ${from},</p>
      <p>You requested a withdrawal.</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendUserDepositEmail = async ({ from, to, amount, method, timestamp }) => {
  await sendEmail({
    to,
    subject: "Deposit Confirmation",
    title: "Deposit Confirmation",
    bodyHtml: `
      <p>Hello ${from},</p>
      <p>You have sent a deposit order.</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendPlanEmail = async ({ from, subamount, subname, timestamp }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "Plan Subscription Notification",
    title: "Plan Subscription",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>${from} subscribed $${subamount} to ${subname} plan.</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendUserPlanEmail = async ({ from, to, subamount, subname, timestamp }) => {
  await sendEmail({
    to,
    subject: "Plan Subscription Confirmation",
    title: "Plan Subscription Confirmation",
    bodyHtml: `
      <p>Hello ${from},</p>
      <p>You successfully subscribed $${subamount} to ${subname} plan.</p>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
    `,
  });
};

const sendUserDetails = async ({ to, password, firstName }) => {
  await sendEmail({
    to,
    subject: "User Account Details",
    title: "Your Account Details",
    bodyHtml: `
      <p>Hello ${firstName},</p>
      <p>Thank you for registering. Your login information:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>If you did not authorize this registration, contact support immediately.</p>
    `,
  });
};

const sendKycAlert = async ({ firstName }) => {
  await sendEmail({
    to: "support@Paidstocks.com",
    subject: "KYC Submission Alert",
    title: "KYC Submission Alert",
    bodyHtml: `
      <p>Hello Chief,</p>
      <p>User ${firstName} has submitted KYC details. Kindly check your dashboard to view details.</p>
    `,
  });
};

// ----------------------
// Exports
// ----------------------
module.exports = {
  hashPassword,
  compareHashedPassword,
  sendWelcomeEmail,
  userRegisteration,
  resendWelcomeEmail,
  sendPasswordOtp,
  resetEmail,
  sendVerificationEmail,
  sendDepositEmail,
  sendDepositApproval,
  sendBankDepositRequestEmail,
  sendWithdrawalRequestEmail,
  sendWithdrawalEmail,
  sendUserDepositEmail,
  sendPlanEmail,
  sendUserPlanEmail,
  sendUserDetails,
  sendKycAlert
};
