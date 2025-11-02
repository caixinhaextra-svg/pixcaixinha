// index.js
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import https from "https";
import EfiPay from "sdk-node-apis-efi";

const app = express();
app.use(bodyParser.json());

// 🔐 Variáveis de ambiente (Render → Environment)
const {
  CLIENT_ID,
  CLIENT_SECRET,
  CERT_PEM,
  KEY_PEM,
  AMBIENTE
} = process.env;

// Configuração do certificado (carregado de variáveis)
const options = {
  sandbox: AMBIENTE === "homologacao", // true para teste, false para produção
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  certificate: {
    cert: CERT_PEM,
    key: KEY_PEM
  },
  cert_base64: true
};

// 🟢 TESTE BÁSICO
app.get("/", (req, res) => {
  res.send("Servidor PixCaixinha rodando 🚀");
});

// 🟣 ROTA PRINCIPAL — /pix
app.post("/pix", async (req, res) => {
  try {
    const { valor, cliente, mes } = req.body;

    console.log("📥 Recebido:", req.body);

    // Configurações do PIX
    const efiPay = new EfiPay(options);
    const txid = `PIX${Date.now()}`;

    const params = { txid };
    const body = {
      calendario: { expiracao: 3600 },
      devedor: {
        nome: cliente || "Cliente Caixinha",
        cpf: "12345678909" // CPF de teste (em homologação é aceito qualquer)
      },
      valor: { original: valor.toFixed(2) },
      chave: "sua_chave_pix_aqui@seudominio.com",
      solicitacaoPagador: `Mensalidade ${mes}`
    };

    // Cria cobrança imediata
    const response = await efiPay.pixCreateImmediateCharge([], body);
    console.log("✅ PIX gerado:", response);

    // Gera QR Code
    const qrcode = await efiPay.pixGenerateQRCode({ id: response.loc.id });

    res.json({
      sucesso: true,
      txid,
      valor,
      mes,
      cliente,
      qrcode: qrcode.imagemQrcode,
      copiaECola: qrcode.qrcode
    });
  } catch (err) {
  console.error("❌ ERRO DETALHADO NA ROTA /PIX:");
  console.error("Mensagem:", err.message);
  console.error("Stack:", err.stack);
  console.error("Resposta completa:", err.response?.data || err);
  res.status(500).json({
    sucesso: false,
    erro: err.message,
    detalhes: err.response?.data || null
  });
}


// 🟩 Porta dinâmica (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
