const nodemailer = require("nodemailer");
//Nodemailer
const sendEmail = async (options) => {
  // 1) Create transporter (service that will send emails like "Gmail" , "MailGun" , "mailtrap" , "sendGrid")
  const transporter = nodemailer.createTransport({
    service: "gmail", // service name which we are using here is gmail
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false =>> port is 587, if true =>> port is 465
    tls: {rejectUnauthorized: false},
    requireTLS: true,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define emai1l opitions (from , to , email content , html format)

  const mailOpts = {
    from: "E-shop app <me782003f@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // 3) send email
  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
