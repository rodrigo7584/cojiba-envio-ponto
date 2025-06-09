// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const uploadDualRoutes = require("./routes/uploadDualRoutes");

const app = express();

// Configura CORS
app.use(
	cors({
		origin: '*',
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type"],
	}),
);

// Middleware para ler JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rotas
app.use("/api/uploadDual", uploadDualRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
