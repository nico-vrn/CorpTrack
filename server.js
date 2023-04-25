import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import sp500CompaniesAsJSON from 'sp500-companies-as-json'

dotenv.config();
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/data/:search', async (req, res) => {
  const shodanKey = process.env.shodanKey;
  //console.log('API Key:', shodanKey)
  if (shodanKey) {
    console.log("API shodan OK")
  }
  else {
    console.log("API shodan NOT OK")
  }
  const searchTerm = req.params.search;
  const data = await fetchExternalApi(shodanKey, searchTerm);
  res.json(data);
});

async function fetchExternalApi(apiKey, searchTerm) {
  const apiUrl = `https://api.shodan.io/shodan/host/${searchTerm}?key=${apiKey}`;
  //console.log('API URL:', apiUrl)
  const response = await fetch(apiUrl);
  const textResponse = await response.text();
  //console.log('API Response:', textResponse);
  const data = JSON.parse(textResponse);
  return data;
}

async function getSp500Companies() {
  const companies = await sp500CompaniesAsJSON();
  //console.log(companies.length)
  //console.log(companies[120])
  if (companies.length === 505) {
    console.log("API S&P500 OK")
  }
  else {
    console.log("API S&P500 NOT OK")
  }
  return companies;
}

app.get('/api/companies', async (req, res) => {
  const companies = await getSp500Companies();
  res.json(companies);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});