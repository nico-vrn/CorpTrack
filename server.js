import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';


dotenv.config();
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/data/:search', async (req, res) => {
  const shodanKey = process.env.shodanKey;
  console.log('API Key:', shodanKey)
  const searchTerm = req.params.search;
  const data = await fetchExternalApi(shodanKey, searchTerm);
  res.json(data);
});


async function fetchExternalApi(apiKey, searchTerm) {
  const apiUrl = `https://api.shodan.io/shodan/host/${searchTerm}?key=${apiKey}`;
  console.log('API URL:', apiUrl)
  const response = await fetch(apiUrl);
  const textResponse = await response.text();
  console.log('API Response:', textResponse);
  const data = JSON.parse(textResponse);
  return data;
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});