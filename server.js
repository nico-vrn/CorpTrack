const dotenv = require('dotenv');
const express = require('express');

dotenv.config();
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {
    shodanKey: process.env.shodanKey
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

