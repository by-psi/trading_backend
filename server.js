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

async function getAveragePrice() {
    const response = await axios.get("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    return parseFloat(response.data.weightedAvgPrice); 
}

async function getDailyHighLow() {
    const response = await axios.get("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    highestPrice = parseFloat(response.data.highPrice); // Preço mais alto das últimas 24h
    lowestPrice = parseFloat(response.data.lowPrice);   // Preço mais baixo das últimas 24h
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

    const BUY_PRICE = await getAveragePrice();
    if (!BUY_PRICE) return console.error("Erro ao obter preço médio. Monitoramento pausado.");

    const SELL_PRICE = BUY_PRICE * 1.1;
    const price = await getBTCPrice();

    console.log(`BTC Atual: ${price} | Preço Médio 24h: ${BUY_PRICE}`);

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

app.get("/btc-average-price", async (req, res) => {
	try {
        const price = await getAveragePrice();
        res.json({ avgPrice: price });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar preço" });
    }
});

app.post('/send-alerts', async (req, res) => {
    if (!alerts) {
        alerts = true;
        const BUY_PRICE = await getAveragePrice();
        if (!BUY_PRICE) return console.error("Erro ao obter preço médio. Monitoramento pausado.");
    
        const SELL_PRICE = BUY_PRICE * 1.1;
        const price = await getBTCPrice();
    
        console.log(`BTC Atual: ${price} | Preço Médio 24h: ${BUY_PRICE}`);
    
        if (price <= BUY_PRICE) await sendTelegramMessage(`🔵 BTC caiu para ${price}. Hora de comprar!`);
        else if (price >= SELL_PRICE) await sendTelegramMessage(`🔴 BTC subiu para ${price}. Hora de vender!`);
    }
    res.json({ status: "Alerta enviado." });
});

app.get('/trade-recommendation', async (req, res) => {
    try {
        await getDailyHighLow();
        const price = await getBTCPrice();

        let recommendation = "Aguardando melhores oportunidades...";
        const sellThreshold = highestPrice * 0.98; // Vender se estiver 2% abaixo da resistência
        const buyThreshold = lowestPrice * 1.02; // Comprar se estiver 2% acima do suporte

        if (price <= buyThreshold) {
            recommendation = "🔵 Recomendação: COMPRAR! O BTC está próximo do suporte.";
        } else if (price >= sellThreshold) {
            recommendation = "🔴 Recomendação: VENDER! O BTC está próximo da resistência.";
        }

        res.json({ price, highestPrice, lowestPrice, recommendation });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar preço" });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

