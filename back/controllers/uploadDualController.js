// uploadDualController.js
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");
const { extractTextFromPDF } = require("../services/pdfService");
const { sendEmail } = require("../services/emailService");

async function processarDual(req, res) {
  try {
    const pdfColaboradores = req.files.pdfColaboradores[0];
    const pdfTarget = req.files.pdfTarget[0];

    const dataBuffer = fs.readFileSync(pdfColaboradores.path);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const colaboradores = [];
    const regex = /Nome:\s+\d+-([A-Z\s]+)\s[\s\S]+?E-Mail\s+Comercial:\s*([\w.-]+@[\w.-]+\.\w+)/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const nome = match[1].trim();
      const email = match[2].trim();
      colaboradores.push({ nome, email });
    }

    fs.unlinkSync(pdfColaboradores.path);

    if (colaboradores.length < 1) {
      return res.status(400).json({
        mensagem: "Nenhum colaborador encontrado no PDF de colaboradores",
      });
    }

    const pdfBytes = fs.readFileSync(pdfTarget.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();

    const resultados = [];

    for (let i = 0; i < numPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      const pdfData = await newPdf.save();

      const outputPath = `uploads/page-${i + 1}.pdf`;
      fs.writeFileSync(outputPath, pdfData);

      const pageText = await extractTextFromPDF(outputPath);
      const linhas = pageText.split("\n").map((l) => l.trim());
      const linhaColaborador = linhas[6];

      if (linhaColaborador) {
        const colaboradorEncontrado = colaboradores.find((col) =>
          linhaColaborador.toLowerCase().includes(col.nome.toLowerCase().trim())
        );     

        if (colaboradorEncontrado) {
          resultados.push({
            nome: colaboradorEncontrado.nome,
            email: colaboradorEncontrado.email,
            pagina: i + 1,
            pdf: outputPath
          });
          
        } else {
          resultados.push({
            nome: linhaColaborador,
            email: null,
            pagina: null,
            pdf: null
          });
          fs.unlinkSync(outputPath);
        }
      } else {
        fs.unlinkSync(outputPath);
      }
    }

    fs.unlinkSync(pdfTarget.path);

    return res.json({ resultados });
  } catch (err) {
    console.error("Erro ao processar:", err);
    return res.status(500).json({ error: "Erro ao processar os PDFs." });
  }
}

async function enviarEmails(req, res) {
  try {
    const { lista } = req.body; // [{ nome, email, pagina, pdf }]

    for (const item of lista) {
      if(item.email){
        await sendEmail(item.email, item.pdf);
        fs.unlinkSync(item.pdf);
      }
    }

    return res.json({ mensagem: "E-mails enviados com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar emails:", err);
    return res.status(500).json({ error: "Erro ao enviar os e-mails." });
  }
}

async function cancelarOperacao(req, res) {
  try {
    const files = fs.readdirSync("uploads");
    for (const file of files) {
      fs.unlinkSync(path.join("uploads", file));
    }
    return res.json({ mensagem: "Operação cancelada e arquivos limpos." });
  } catch (err) {
    console.error("Erro ao cancelar:", err);
    return res.status(500).json({ error: "Erro ao limpar os arquivos." });
  }
}

module.exports = { processarDual, enviarEmails, cancelarOperacao };
