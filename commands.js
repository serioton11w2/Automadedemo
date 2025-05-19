// commands.js
import { parseDuration, escapeMarkdownV2, isAdmin } from './utils.js';

export function setupCommands(bot, groupSettings) {
  // Delete command messages after 30s
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    if ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && msg.text?.startsWith('/')) {
      setTimeout(() => {
        bot.deleteMessage(chatId, messageId).catch(() => {});
      }, 30 * 1000);
    }
  });

  // /settimer <10s|5m|off> - admin only
  bot.onText(/\/settimer (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') return;

    const input = match[1].trim();
    const admin = await isAdmin(bot, chatId, msg);
    if (!admin) return;

    if (!/^(\d+)(s|m)$|^off$/i.test(input)) {
      const res = await bot.sendMessage(chatId, 'Invalid format. Use like `10s`, `5m`, or `off`.', { parse_mode: 'MarkdownV2' });
      setTimeout(() => bot.deleteMessage(chatId, res.message_id).catch(() => {}), 30 * 1000);
      return;
    }

    if (input.toLowerCase() === 'off') {
      delete groupSettings[chatId];
    } else {
      groupSettings[chatId] = input.toLowerCase();
    }

    const escapedTimer = escapeMarkdownV2(input);
    const res = await bot.sendMessage(chatId, `Timer set to *${escapedTimer}*`, { parse_mode: 'MarkdownV2' });
    setTimeout(() => bot.deleteMessage(chatId, res.message_id).catch(() => {}), 30 * 1000);
  });

  // /status - anyone can check
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const timer = groupSettings[chatId] || 'No auto-delete timer set (default off)';
    const escapedTimer = escapeMarkdownV2(timer);
    bot.sendMessage(chatId, `Current auto-delete timer: *${escapedTimer}*`, { parse_mode: 'MarkdownV2' })
      .then(res => setTimeout(() => bot.deleteMessage(chatId, res.message_id).catch(() => {}), 30 * 1000));
  });

  // /start - help message
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
🤖 *Auto-Delete Media Bot*

This bot automatically deletes media messages in groups.

*🛠 Available Commands:*

/start – Show this help message  
/status – Show current auto-delete timer  

*Admin Only (including anonymous admins):*
/settimer <time|off> – Set default delete timer  
Example: \`/settimer 10s\`, \`/settimer 5m\`, or \`/settimer off\`

📝 *Per-message timer:*
Add a timer in caption like \`10s\` or \`2m\` to auto-delete that media after specified time.

💬 *Supported Media:*
Photos, videos, documents, audio, and voice messages.

🔒 *Notes:*
- Works only in group chats
- Settings reset on restart (no database)
    `.trim();

    bot.sendMessage(chatId, helpText, { parse_mode: 'MarkdownV2' })
      .then(res => setTimeout(() => bot.deleteMessage(chatId, res.message_id).catch(() => {}), 30 * 1000));
  });
}
