const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_APIKEY, { polling: true });
const axios = require('axios');

bot.onText(/\/music (.+)/, (msg, match) => {
  let music = match[1];
  let chatId = msg.chat.id;

  // Get Data
  (async () => {
    bot.sendMessage(chatId, '_Looking for _' + music + '...', {
      parse_mode: 'Markdown',
    });

    try {
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
    // const downloadURL = `https://cutepup.club/${url}`;
    limited.forEach((music) => {
      const {
        title,
        url,
        duration,
        thumbnail_src,
        views,
        upload_date,
      } = music.video;

      const options = {
        caption: `\nTitle: ${title} \nDuration: ${duration} \nViews: ${views} \nRelease Date: ${upload_date} \n🚀 Download Here: https://cutepup.club/${url}`,
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
