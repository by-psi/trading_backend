/** 
 * telegram.js
 */

const axios = require("axios");
require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(message) {
	try {
		const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
		await axios.post(url, {
			chat_id: TELEGRAM_CHAT_ID,
			text: message,
		});
		console.log("Mensagem enviada para o Telegram!");
	} catch (error) {
		console.error("Erro ao enviar mensagem para o Telegram:", error);
	}
}

module.exports = { sendTelegramMessage };
