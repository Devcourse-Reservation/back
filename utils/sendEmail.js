const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // 이메일 서비스 (Gmail 사용)
  auth: {
    user: process.env.EMAIL_USER, // 발신자 이메일
    pass: process.env.EMAIL_PASSWORD, // 앱 비밀번호
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to, // 수신자 이메일
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
