import nodemailer from "nodemailer";

function isConfigured(){
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendVerificationCode({ to, code }){
  if(!isConfigured()){
    console.log("📧 [DEV] Verification code for", to, "=>", code);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "LogiGuard360 verification code",
    text: `Your LogiGuard360 verification code is: ${code}\n\nThis code expires in 2 minutes.`
  });
}
