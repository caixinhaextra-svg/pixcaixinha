import express from "express";
import EfiPay from "sdk-node-apis-efi";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// ⚙️ Configurações EFI
const options = {
  sandbox: true, // false = produção
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  certificate: fs.readFileSync("./certs/certificado.crt.pem"),
  privateKey: fs.readFileSync("./certs/certificado.key.pem"),
  cert_base64: false
};

// Inicializa o SDK
const efipay = new EfiPay(options);

// 🚀 Rota de teste
app.get("/", async (req, res) => {
  try {
    const response = await efipay.get("gn.status", {});
    res.json({ sucesso: true, data: response });
  } catch (error) {
    console.error("❌ Erro EFI:", error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
