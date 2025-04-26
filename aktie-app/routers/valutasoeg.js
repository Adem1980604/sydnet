'use strict';
const express = require('express');
const axios = require('axios'); // axios, som er et moderne og populært HTTP-klientbibliotek Denne gør HTTP kaldet mere simpelt og lækkert
const router = express.Router();

// Emil's valuta kurs API key // 
const apiKey = "4471cd41f9c9723ed298ca8d";
//let offlineResponseData;

// Venstre side af kontooplysninger (under opret konto)
//router.get('/aktiesoegning', async function (req, res) {
//  console.log("DEBUG: 100 - initiated route get /aktiesoegning");  
//  res.render('bruger-sider/aktiesoeg');  
//});

router.get('/hentvalutakurs/:valuta', async function (req, res) {

  const valuta = req.params.navn;
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${valuta}`;
  console.log("******************** URL ****************");
  console.log(url);
  const live = true;

  if (live == true) {
    const response = await axios.get(url);
    console.log(response);
  };
  console.log("****************response data**************");
  console.log(response.data);
  res.json(response.data);
});

module.exports = router;