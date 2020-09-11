const express = require('express');
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
