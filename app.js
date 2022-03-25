import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';
import exifremove from 'exifremove';
import fs from 'fs';
import { randomUUID } from 'crypto';
import util from 'util';
import stream from 'stream';
import path from 'path';
import { exec } from 'child_process';

const pipeline = util.promisify(stream.pipeline)

dotenv.config();

const TOKEN = process.env.BOT_TOKEN ?? "API_KEY";

const bot = new Telegraf(TOKEN)

bot.start((ctx) => {
	ctx.reply('Бот призначений для видалення геометок з файлів, та очищення метаданних файлів, скидаєте оригінал (файлом) фото, відео. А бот очищає і повертає файл.')
})

bot.on('photo', async (ctx) => {
	console.log('Receive photo')
	let fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id
	let fileData = await bot.telegram.getFile(fileId)
	let imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileData.file_path}`
	try {
		console.log(imageUrl)
		let response = await axios.get(imageUrl, { 
			responseType: 'stream'
		})
		if (!fs.existsSync('images')) { 
			fs.mkdir('images', err => {
				console.log(err)
			}) 
		}
		let fileName = `clear_image_${randomUUID()}.jpg`
		let filePath = `images/${fileName}`
		let stream = fs.createWriteStream(filePath)
		response.data.pipe(stream)
		stream.on('close', () => {
			let imageFile = fs.readFileSync(path.resolve() + '/' + filePath)
			let clearedFile = exifremove.remove(imageFile)
			fs.writeFileSync(filePath, clearedFile)
			ctx.replyWithPhoto({ 
				source: imageFile,
				filename: fileName
			}, {
				caption: 'Фото очищено від метаданих.'
			})
		})
	} catch (error) {
		console.log(error)
		ctx.replyWithHTML(`Помилка: ${error.message}`)
	}
})
bot.on('message', (ctx) => {
	console.log(`Received messages: ${ctx.message.text}`)
	if (ctx.message.text === 'clear all files [admin]') {
		let imagesFolder = path.resolve() + '/images'
		exec(`rm -rf ${imagesFolder}`, (err) => {
			if (err != null) console.log(err)
		})
		ctx.reply(`Images folder was cleared!`)
	}
})

console.log('Bot is started');
bot.launch();

