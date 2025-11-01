import express from "express";
import fs from "fs";
import EfiPay from "efipay";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const options = {
  sandbox: true,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  certificate: fs.readFileSync(process.env.CERT_PATH),
};

const efipay = new EfiPay(options);

app.get("/", (req, res) => {
  res.send("✅ Servidor da Caixinha Extra rodando com sucesso!");
});

app.post("/pix", async (req, res) => {
  try {
    const { valor, cliente, mes } = req.body;

    if (!valor || !cliente || !mes) {
      return res.status(400).json({ sucesso: false, erro: "Campos obrigatórios ausentes." });
    }

    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: process.env.PIX_KEY,
      solicitacaoPagador: `Mensalidade ${mes} - ${cliente}`,
    };

    console.log("🧾 Criando cobrança PIX:", body);

    const cobranca = await efipay.createImmediateCharge([], body);
    const qrCode = await efipay.generateQRCode({ id: cobranca.loc.id });

    const resultado = {
      sucesso: true,
      cliente,
      mes,
      valor,
      txid: cobranca.txid,
      qrCode: qrCode.imagemQrcode,
      copiaECola: qrCode.qrcode,
    };

    console.log("✅ PIX gerado com sucesso:", resultado);
    res.json(resultado);
  } catch (erro) {
    console.error("❌ Erro ao gerar PIX:", erro);
    res.status(500).json({
      sucesso: false,
      erro: erro.message || "Erro desconhecido ao gerar PIX",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
