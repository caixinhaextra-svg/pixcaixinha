# 🏦 PixCaixinha - Servidor Node.js (Pix via EfiPay)

Servidor Node.js com autenticação mTLS integrado à API Pix da EfiPay, criado para o projeto **Caixinha Extra 2026**.

## 🚀 Como usar

### 1️⃣ Rodar localmente
```bash
npm install
npm start
```
Acesse em [http://localhost:3000](http://localhost:3000)

### 2️⃣ Deploy no Render
1. Crie um repositório no GitHub com esses arquivos
2. No Render, escolha **New → Web Service**
3. Configure:
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
4. Adicione as variáveis do `.env.example`
5. Envie manualmente o `certificado.p12` para `/etc/ssl/certs/`
6. Após o deploy, teste:
```
GET  https://pixcaixinha.onrender.com/
POST https://pixcaixinha.onrender.com/pix
```
