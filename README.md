# ProcureAI — Deploy na VPS

## Pré-requisitos
- Node.js 18+ instalado
- Nginx configurado
- Chave de API Anthropic

---

## 1. Enviar arquivos para a VPS

```bash
# Na sua máquina local — compacte o projeto
zip -r procureai.zip procureai/

# Envie via scp
scp procureai.zip usuario@ip-da-vps:/var/www/

# Na VPS — descompacte
ssh usuario@ip-da-vps
cd /var/www
unzip procureai.zip
cd procureai
```

---

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3000
```

---

## 3. Instalar dependências e testar

```bash
npm install
npm start
# Teste: curl http://localhost:3000
```

---

## 4. Configurar nginx

```bash
# Edite o arquivo substituindo o domínio
sudo nano /etc/nginx/sites-available/procureai
# Cole o conteúdo de nginx/procureai.conf
# Substitua "procure.seudominio.com" pelo seu subdomínio

sudo ln -s /etc/nginx/sites-available/procureai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Rodar como serviço com PM2 (recomendado)

```bash
npm install -g pm2
pm2 start server.js --name procureai
pm2 save
pm2 startup   # siga o comando que o PM2 exibir
```

Comandos úteis:
```bash
pm2 status           # ver status
pm2 logs procureai   # ver logs
pm2 restart procureai
```

---

## 6. SSL com Certbot (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d procure.seudominio.com
```

Após o certbot, descomente o bloco HTTPS no nginx/procureai.conf e recarregue o nginx.

---

## Estrutura do projeto

```
procureai/
├── server.js          # Backend Express + proxy Anthropic
├── package.json
├── .env               # Chave API (nunca commitar!)
├── .env.example
├── public/
│   └── index.html     # Frontend completo
└── nginx/
    └── procureai.conf # Config nginx
```
