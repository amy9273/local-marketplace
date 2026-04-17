const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Add these options for Mailtrap
    tls: {
      rejectUnauthorized: false // For development only
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Amy Balion <amybalion533@gmail.com>', // Use a proper from address
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can add HTML version later
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;