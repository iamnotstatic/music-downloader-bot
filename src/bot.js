const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_APIKEY, { polling: true });
const axios = require('axios');
const TinyURL = require('tinyurl');

// Process Music download
bot.on('message', (msg) => {
  let music = msg.text;
  let chatId = msg.chat.id;

  // Get Data
  (async () => {
    try {
      // Set Laoding
      bot.sendMessage(chatId, '_Looking for _' + music + '...', {
        parse_mode: 'Markdown',
      });

      const res = await axios.get(
        `http://youtube-scrape.herokuapp.com/api/search?q=${music} music/`
      );

      if (res.data.results.length === 0) {
        bot.sendMessage(
          chatId,
          `Bad request, Please check the title ${music} and try again`
        );
      } else {
        getDownloadURL(res.data.results);
      }
    } catch (error) {
      console.log(error);
      bot.sendMessage(
        chatId,
        `Bad request, Please check the title ${music} and try again`
      );
    }
  })();

  // Return response to user with information and URL
  const getDownloadURL = (data) => {
    data.splice(0, 5).forEach((music) => {
      const { title, url, duration, thumbnail_src, views, upload_date } =
        music.video || music.radio || music.playlist || music.channel;

      // Initial URL
      const initURL = `https://cutepup.club/${url}`;

      // shorten Init URL
      TinyURL.shorten(initURL, function (res, err) {
        if (err) console.log(err);

        // Shortend URL
        let shortendURL = res;

        const options = {
          caption: `\nTitle: ${title} ${
            duration !== undefined ? `\nDuration: ${duration}` : ''
          } ${views !== undefined ? `\nViews: ${views}` : ''} ${
            upload_date !== undefined ? `\nRelease Date: ${upload_date}` : ''
          } \n \n🚀 Download Here: ${shortendURL} \n \nDownload your music with ease here http://t.me/musichive_bot`,
          reply_markup: JSON.stringify({
            inline_keyboard: [[{ text: 'Download', url: shortendURL }]],
          }),
        };

        bot.sendPhoto(chatId, thumbnail_src, options);
      });
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
