// utils.js
import TelegramBot from 'node-telegram-bot-api';

/**
 * Parse durations like "10s", "5m"
 * Returns milliseconds or null if invalid
 */
export function parseDuration(text) {
  const match = text?.match(/^(\d+)(s|m)$/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  return unit === 's' ? num * 1000 : num * 60 * 1000;
}

/**
 * Escape string for Telegram MarkdownV2
 */
export function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Check if user is admin or anonymous admin in chat
 * @param {TelegramBot} bot
 * @param {number} chatId
 * @param {object} msg - telegram message object
 * @returns {Promise<boolean>}
 */
export async function isAdmin(bot, chatId, msg) {
  if (msg.sender_chat && msg.sender_chat.id === chatId) return true; // anonymous admin
  if (msg.from) {
    try {
      const member = await bot.getChatMember(chatId, msg.from.id);
      return ['administrator', 'creator'].includes(member.status);
    } catch {
      return false;
    }
  }
  return false;
}
