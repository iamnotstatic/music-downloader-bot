const express = require('express');
const scraper = require('./scrapper');
const packageInfo = require('../package.json');
require('./bot');

const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to Music Downloader BOt',
    link: 'http://t.me/musichive_bot',
    version: packageInfo.version,
  });
});

//API route
app.get('/api/search', (req, res) => {
  scraper
    .youtube(req.query.q, req.query.page)
    .then((x) => res.json(x))
    .catch((e) => res.send(e));
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
