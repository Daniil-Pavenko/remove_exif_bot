import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';
import utf8 from 'utf8';
import FormData from 'form-data';

dotenv.config();

const TOKEN = process.env.BOT_TOKEN ?? "API_KEY";

const bot = new Telegraf(TOKEN)

bot.start((ctx) => {
	ctx.reply('Бот призначений для видалення геометок з файлів, та очищення метаданних файлів, скидаєте оригінал (файлом) фото, відео. А бот очищає і повертає файл.')
})

bot.on('photo', async (ctx) => {
	
})

console.log('Bot is started');
bot.launch();

