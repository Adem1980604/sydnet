'use strict';
const express = require('express'); 
//const axios = require('axios'); // axios, som er et moderne og populært HTTP-klientbibliotek Denne gør HTTP kaldet mere simpelt og lækkert
const router = express.Router();

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
const apiKey = 'SBD4RTB73V5BISI9';

// Venstre side af kontooplysninger (under opret konto)
router.get('/aktiesoegning', async function (req, res) {
  console.log("DEBUG: 100 - initiated route get /aktiesoegning");  
  res.render('bruger-sider/aktiesoeg');  
});


router.get('/getaktiekurs/:navn', (req, res) => {
  const navn = req.params.navn;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${navn}&interval=60min&apikey=${apiKey}`;
  console.log("******************** URL ****************");
  console.log(url);

  https.get(url, (response) => {
    let data = '';

    // A chunk of data has been received.
    response.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('An error occurred while parsing data');
      }
    });

  }).on('error', (error) => {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching data');
  });
});


module.exports = router;