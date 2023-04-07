import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';


dotenv.config();
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/data', async (req, res) => {
  const shodanKey = process.env.shodanKey;
  // Utilisez l'apiKey pour effectuer un appel API à l'API externe
  // et récupérer les données
  const data = await fetchExternalApi(shodanKey);
  res.json(data);
});

async function fetchExternalApi(apiKey) {
  // Implémentez cette fonction pour effectuer l'appel API avec l'apiKey
  // et retourner les données. Par exemple:
  console.log('API Key:', apiKey);
  const apiUrl = "https://api.shodan.io/shodan/host/8.8.8.8?key="+apiKey;
  console.log("API URL:", apiUrl)
  const response = await fetch(apiUrl);
  const textResponse = await response.text();
  console.log('API Response:', textResponse);
  const data = JSON.parse(textResponse);
  return data;
}


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

