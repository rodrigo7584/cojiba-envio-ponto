// emailService.js
const nodemailer = require("nodemailer");

async function sendEmail(to, attachmentPath) {
	const transporter = nodemailer.createTransport({
		host: "suite.penso.com.br",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.SENHA,
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	await transporter.sendMail({
		from: "rodrigo.gandhi@cojiba.com.br",
		to,
		subject: "Seu espelho de ponto",
		text: "Segue em anexo seu espelho de ponto, não responda esse email.",
		attachments: [{ path: attachmentPath }],
	});
}

module.exports = {
	sendEmail,
};
