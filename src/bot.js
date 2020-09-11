const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_APIKEY, { polling: true });
const axios = require('axios');
const TinyURL = require('tinyurl');
const fs = require('fs').promises;
const FILE_PATH = 'stats.txt';

let pingCount = 0;
// Welcome Message
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `*Hi ${msg.from.first_name}*, Welcome to Music Downloader Bot! 🤖 \n \nTo download music you have to enter the music name eg. _Eminem godzilla._ `,
    { parse_mode: 'Markdown' }
  );
});

// Process Music download
bot.on('message', (msg) => {
  let music = msg.text;
  let chatId = msg.chat.id;

  if (music !== '/start' && music !== '/help' && music !== '/stats') {
    // store in object
    pingCount++;

    // sAVE Request
    (async () => {
      await fs.writeFile(
        FILE_PATH,
        JSON.stringify({ count: pingCount }),
        'utf8'
      );
    })();

    // Get Data
    (async () => {
      try {
        // Set Laoding
        bot.sendMessage(chatId, '_Looking for _' + music + '...', {
          parse_mode: 'Markdown',
        });

        const res = await axios.get(
          `http://youtube-scrape.herokuapp.com/api/search?q=${music} audio/`
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
  }
});

// Get number of Requets
bot.onText(/\/stats/, (msg, match) => {
  let chatId = msg.chat.id;

  (async () => {
    const res = await fs.readFile(FILE_PATH, 'utf8');
    const intData = JSON.parse(res);

    bot.sendMessage(chatId, `Number of Requests: ${intData.count}`, {
      parse_mode: 'Markdown',
    });
  })();
});

// Get instructions
bot.onText(/\/help/, (msg, match) => {
  let chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'INSTRUCTION \n \nTo download music you have to enter the music name eg. `Eminem godzilla.` \n\nPlease be specific with the name.',
    {
      parse_mode: 'Markdown',
    }
  );
});

bot.on('polling_error', (err) => console.log(err));
