const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.text());

// async..await is not allowed in global scope, must use a wrapper
async function main(from, to, subject, text, html) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //   let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_AUTH, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
    tls: { rejectUnauthorized: false },
    logger: true,
    debug: true,
  });

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: from, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    return info;
  } catch (e) {
    return e;
  }
}

app.post("/send", async function (req, res) {
  const { from, to, subject, text } = req.query;
  const html = req.body;

  var info = await main(from, to, subject, text, html);
  res.send(info);
});

app.listen(port, () => {
  console.log(`SendMail rodando na porta http://localhost:${port}`);
});
