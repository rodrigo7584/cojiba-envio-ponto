const express = require("express");
const multer = require("multer");
const { processarDual, enviarEmails, cancelarOperacao } = require("../controllers/uploadDualController");

const router = express.Router();

const upload = multer({ dest: "arquivos/" });

// Rota 1: Processar os PDFs e retornar a lista de ações sugeridas, SEM ENVIAR EMAILS
router.post(
	"/processarDual",
	upload.fields([
		{ name: "pdfColaboradores", maxCount: 1 },
		{ name: "pdfTarget", maxCount: 1 },
	]),
	processarDual
);

// Rota 2: Enviar os e-mails após a confirmação do usuário
router.post("/enviarEmailsDual", enviarEmails);

// Rota 2: Enviar os e-mails após a confirmação do usuário
router.post("/cancelarOperacao", cancelarOperacao);

module.exports = router;
