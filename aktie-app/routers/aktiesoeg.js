'use strict';
const express = require('express'); 
const axios = require('axios'); // axios, som er et moderne og populært HTTP-klientbibliotek Denne gør HTTP kaldet mere simpelt og lækkert
const router = express.Router();
//const { getStockData } = require('./stockData');

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
// Emil's API key // 
const apiKey = "SBD4RTB73V5BISI9";

//Jan's API key//
//const apiKey = "X8PAHO4XS77MP7N8";
// Venstre side af kontooplysninger (under opret konto)
router.get('/aktiesoegning', async function (req, res) {
  console.log("DEBUG: 100 - initiated route get /aktiesoegning");  
  res.render('bruger-sider/aktiesoeg');  
});


router.get('/getaktiekurs/:navn', async function (req, res) {
  const navn = req.params.navn;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${navn}&interval=60min&apikey=${apiKey}`;
  console.log("******************** URL ****************");
  console.log(url);

  const response = await axios.get(url,{responseType: "json",limit:1,timeout: 2000,});
  const my_data = response.data;
  let my_array = [];
  for(var i in my_data) {
    my_array.push([i, my_data [i]]);
  }
  console.log(my_array[0]);
  console.log(my_array[1]);
  
  //my_data. (element => {console.log(element);})

    
  
  //console.log(response.data);
  //test_object = response.data;
  //console.log(.values('Meta Data'))

  //axios.interceptors.response.use(
  //  (response) => {
  //    const { data } = response
  //    console.log(data)
  //    const { name } = data[0]
//
  //    //return name;
  //    console.log(name)
  //  },
  //  (error) => {
  //    //return Promise.reject(error);
  //  }
  //);

  //console.log(Object.values('Meta Data'))
  //console.log(JSON.stringify(response.data));
  //console.log(response.data.get('Meta Data'));

  
  //const getStockData = async (req, res) => {
  //  try 
  //  {
  //    const response = await axios.get(url);
  //    let data = '';
  //    
  //  }
  //  catch (error) {
  //    console.log("********ERROR *************")
  //    console.log(error.message)
  //  }  
  //};
  //getStockData;

});


/*
router.get('/getaktiekurs/:navn', (req, res) => 
  {
    // Alpha Vantage API URL and API key
    //https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${navn}&interval=60min&apikey=${apiKey}
    const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
    //const apiKey = 'SBD4RTB73V5BISI9';
    const API_KEY = apiKey; // Replace with your actual API key
    // Helper function to convert company name to stock symbol
    const getSymbolFromName = (name) => {
      const companySymbols = {
        'Reliance Industries': 'RELIANCE.BSE',
        'Tata Capital': 'TATACAPITAL.BSE',
        'Apple': 'AAPL',
        'Google': 'GOOG',
        // Add more company-name to symbol mappings as needed
      };
      return companySymbols[name.toLowerCase()] || null;  // Return symbol or null if not found
    };
    // Controller to fetch stock data from Alpha Vantage
    const getStockData = async (req, res) => {
      let { symbol } = req.params; // Get stock symbol from URL parameters
      // Check if the input is a company name rather than a symbol
      if (!symbol.match(/^[A-Za-z0-9.]+$/)) {
        symbol = getSymbolFromName(symbol);
        if (!symbol) {
          return res.status(400).json({
            success: false,
            message: 'Invalid company name or symbol.',
          });
        }
      }
      symbol = symbol.toUpperCase(); // Ensure the symbol is in uppercase
      try {
        // Fetch stock data from Alpha Vantage API
        const response = await axios.get(ALPHA_VANTAGE_API_URL, {
          params: {
            function: 'TIME_SERIES_DAILY', // Fetch daily time series data
            symbol: symbol, // Stock symbol (e.g., RELIANCE.BSE)
            outputsize: 'full', // Retrieve all available data (full dataset)
            apikey: API_KEY, // Your API key
          },
        });
        // Check if the response contains valid data
        if (response.data['Time Series (Daily)']) {
          return res.status(200).json({
            success: true,
            data: response.data['Time Series (Daily)'], // Return the stock data
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to fetch stock data.',
          });
        }
      } catch (error) {
        console.error('Error fetching stock data:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Error fetching stock data from Alpha Vantage API.',
          error: error.message,
        });
      }
    };
    
});
*/
//module.exports = { getStockData };
module.exports = router;