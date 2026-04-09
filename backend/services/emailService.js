const nodemailer = require("nodemailer");

const hasSmtpConfig = () => {
  return (
    !!process.env.SMTP_HOST &&
    !!process.env.SMTP_PORT &&
    !!process.env.SMTP_USER &&
    !!process.env.SMTP_PASS
  );
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendOtpEmail = async ({ toEmail, otp, purpose }) => {
  const appName =
    process.env.APP_NAME || process.env.YOUR_APP_NAME || "KaamKhoj";
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || appName;

  const subject =
    purpose === "login"
      ? `${appName} login OTP`
      : `${appName} signup OTP`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #2552fe; margin-bottom: 8px;">${appName} verification code</h2>
      <p style="color: #333;">Use the OTP below to complete your ${purpose} request.</p>
      <div style="font-size: 28px; letter-spacing: 6px; font-weight: 700; margin: 20px 0; color: #111;">
        ${otp}
      </div>
      <p style="color: #333;">This code expires in 10 minutes.</p>
      <p style="color: #777; font-size: 12px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  if (!hasSmtpConfig()) {
    console.warn(
      `[OTP-DEV] SMTP not configured. OTP for ${toEmail} (${purpose}): ${otp}`
    );
    return { delivered: false, mode: "console" };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to: toEmail,
    subject,
    html,
  });

  return { delivered: true, mode: "smtp" };
};

module.exports = {
  sendOtpEmail,
};
