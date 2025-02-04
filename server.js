/**
 * server.js
*/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

let monitoring = false;
let alerts = false;

async function getBTCPrice() {
    const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    return parseFloat(res.data.price);
}

async function sendTelegramMessage(message) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
        chat_id: CHAT_ID,
        text: message
    });
}

async function monitorPrices() {
    if (!monitoring) return;
    
    const price = await getBTCPrice();
    console.log(`BTC Price: ${price}`);

    const BUY_PRICE = 60000;
    const SELL_PRICE = BUY_PRICE * 1.1;

    if (price <= BUY_PRICE) await sendTelegramMessage(`🔵 BTC caiu para ${price}. Hora de comprar!`);
    else if (price >= SELL_PRICE) await sendTelegramMessage(`🔴 BTC subiu para ${price}. Hora de vender!`);
    
    setTimeout(monitorPrices, 5000);
}

// Rotas da API
app.get('/btc-price', async (req, res) => {
	try {
			const price = await getBTCPrice();
			res.json({ price });
	} catch (error) {
			res.status(500).json({ error: "Erro ao buscar preço" });
	}
});

app.post('/start-monitoring', (req, res) => {
    if (!monitoring) {
        monitoring = true;
        monitorPrices();
    }
    res.json({ status: "Monitoramento iniciado." });
});

app.post('/stop-monitoring', (req, res) => {
    monitoring = false;
    res.json({ status: "Monitoramento parado." });
});

app.post('/send-alerts', async (req, res) => {
    if (!alerts) {
        alerts = true;
        const price = await getBTCPrice();
        await sendTelegramMessage(`📢 BTC agora está em ${price}`);
    }
    res.json({ status: "Alerta enviado." });
});
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

