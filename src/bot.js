const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_APIKEY, { polling: true });
const axios = require('axios');

// Process Music download
bot.onText(/\/music (.+)/, (msg, match) => {
  let music = match[1];
  let chatId = msg.chat.id;

  // Get Data
  (async () => {
    try {
      // Set Laoding
      bot.sendMessage(chatId, '_Looking for _' + music + '...', {
        parse_mode: 'Markdown',
      });

      const res = await axios.get(
        `http://youtube-scrape.herokuapp.com/api/search?q=${music}/`
      );

      getDownloadURL(res.data.results);
    } catch (error) {
      console.log({ error });
      bot.sendMessage(
        chatId,
        `Bad request, Please check the title ${music} and try again`
      );
    }
  })();

  const getDownloadURL = (data) => {
    const size = 5;
    const limited = data.splice(0, size);
    limited.forEach((music) => {
      const {
        title,
        url,
        duration,
        thumbnail_src,
        views,
        upload_date,
      } = music && music.video;

      const options = {
        caption: `\nTitle: ${title} \nDuration: ${duration} \nViews: ${views} \nRelease Date: ${upload_date} \n \n🚀 Download Here: https://cutepup.club/${url} \n \nDownload your music with ease here http://t.me/musichive_bot`,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: 'Download', url: `https://cutepup.club/${url}` }],
          ],
        }),
      };

      bot.sendPhoto(chatId, thumbnail_src, options);
    });
  };
});

// Get instructions
bot.onText(/\/help/, (msg, match) => {
  let music = match[1];
  let chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'INSTRUCTION \n \nTo download a music you have to use the /music command then the title eg. /music eminem godzilla. \n\nPlease be specific with the title.',
    {
      parse_mode: 'Markdown',
    }
  );
});
