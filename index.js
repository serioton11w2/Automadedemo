// index.js
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { parseDuration } from './utils.js';
import { setupCommands } from './commands.js';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const groupSettings = {}; // chatId => timer string

setupCommands(bot, groupSettings);

// Auto-delete media messages based on caption or group default timer
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') return;
  if (msg.text?.startsWith('/')) return;

  const hasMedia = msg.photo || msg.video || msg.document || msg.audio || msg.voice;
  if (!hasMedia) return;

  const captionDuration = parseDuration(msg.caption);
  const groupTimer = parseDuration(groupSettings[chatId]);
  const deleteAfter = captionDuration ?? groupTimer;

  if (deleteAfter && deleteAfter > 0) {
    setTimeout(() => {
      bot.deleteMessage(chatId, messageId).catch(() => {});
    }, deleteAfter);
  }
});
