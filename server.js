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
  
  if (!shodanKey) {
  
    console.log("API shodan NOT OK");
    return res.status(500).json({ error: 'Clé API Shodan introuvable. Veuillez définir la clé API dans vos variables d\'environnement.' });
  
  }
  
  console.log("API shodan OK");

  const searchTerm = req.params.search;
  const data = await fetchExternalApi(shodanKey, searchTerm);
  
  if (data.error) {
    return res.status(500).json(data);
  }

  res.json(data);

  const SubDomainData = await fetchExternalApiSubDomain(shodanKey, searchTerm);
  
  if (SubDomainData.error) {
    return res.status(500).json(SubDomainData);
  }

  res.json(SubDomainData);

});

async function fetchExternalApi(apiKey, searchTerm) {
  try {
    const apiUrl = `https://api.shodan.io/shodan/host/${searchTerm}?key=${apiKey}`;
    const response = await fetch(apiUrl);
    const textResponse = await response.text();
    const data = JSON.parse(textResponse);
    return data;
  } catch (error) {
    console.error('Error fetching data from Shodan API:', error);
    return { error: 'Erreur lors de la récupération des données de l\'API Shodan. Veuillez vérifier votre clé API et réessayer.' };
  }
}

async function fetchExternalApiSubDomain(apiKey, searchTerm) {
  try {
    const apiUrl = `https://api.shodan.io/dns/domain/${searchTerm}?key=${apiKey}`;
    const response = await fetch(apiUrl);
    const textResponse = await response.text();
    const data = JSON.parse(textResponse);
    return data;
  } catch (error) {
    console.error('Error fetching data from Shodan API:', error);
    return { error: 'Erreur lors de la récupération des données de l\'API Shodan. Veuillez vérifier votre clé API et réessayer.' };
  }
}


async function getSp500Companies() {
  const companies = await sp500CompaniesAsJSON();
  //console.log(companies.length)
  //console.log(companies[120])
  if (companies.length >=0) {
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