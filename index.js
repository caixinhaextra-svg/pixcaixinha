import express from "express";
import EfiPay from "sdk-node-apis-efi";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

// 🔐 Configurações do SDK da Efí
const options = {
  sandbox: true, // altere para false em produção
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  certificate: "./certs/certificado.crt.pem" // caminho do seu .pem
};

// 🧾 Instância do cliente Efí
const efipay = new EfiPay(options);

// 🧠 Rota para gerar cobrança Pix
app.post("/pix", async (req, res) => {
  try {
    const { valor, cliente, mes } = req.body;

    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: process.env.PIX_KEY, // sua chave Pix
      solicitacaoPagador: `Pagamento Caixinha (${cliente} - ${mes})`,
    };

    const data = await efipay.pixCreateImmediateCharge([], body);
    const qrcode = await efipay.pixGenerateQRCode({
      id: data.loc.id,
    });

    res.json({
      sucesso: true,
      payload: qrcode.qrcode,
      imagem: qrcode.imagemQrcode,
      valor,
      cliente,
      mes
    });
  } catch (erro) {
    console.error("❌ Erro ao gerar cobrança:", erro.message);
    res.status(500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

// 🔥 Inicia servidor Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
