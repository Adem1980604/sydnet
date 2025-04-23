'use strict';
const express = require('express'); 
const axios = require('axios'); // axios, som er et moderne og populært HTTP-klientbibliotek Denne gør HTTP kaldet mere simpelt og lækkert
const router = express.Router();
//const { getStockData } = require('./stockData');

// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key
// Emil's API key // 
const apiKey = "SBD4RTB73V5BISI9";
let offlineResponseData;
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
  const live = false;

  if (live == true) {
    const response = await axios.get(url);
    //const my_data = res.json(response.data);
    //console.log("****************response**************");
    //console.log(response);


    //console.log("****************response data**************");
    //console.log(response.data);
    res.json(response.data);

  } else {
    if ( navn == "IBM") {
      offlineResponseData = {
          'Meta Data': {
            '1. Information': 'Intraday (60min) open, high, low, close prices and volume',
            '2. Symbol': 'IBM',
            '3. Last Refreshed': '2025-04-17 19:00:00',
            '4. Interval': '60min',
            '5. Output Size': 'Compact',
            '6. Time Zone': 'US/Eastern'
          },
          'Time Series (60min)': {
            '2025-04-17 19:00:00': {
              '1. open': '238.8100',
              '2. high': '239.7900',
              '3. low': '236.2897',
              '4. close': '238.8300',
              '5. volume': '505465'
            },
            '2025-04-17 18:00:00': {
              '1. open': '240.3000',
              '2. high': '240.3000',
              '3. low': '238.8100',
              '4. close': '239.7900',
              '5. volume': '498384'
            },    
            '2025-04-09 19:00:00': {
              '1. open': '235.3100',
              '2. high': '239.9000',
              '3. low': '230.3000',
              '4. close': '236.9700',
              '5. volume': '1005263'
            },
            '2025-04-09 18:00:00': {
              '1. open': '235.7600',
              '2. high': '239.9000',
              '3. low': '230.3000',
              '4. close': '236.9900',
              '5. volume': '1005438'
            },
            '2025-04-09 16:00:00': {
              '1. open': '235.3100',
              '2. high': '239.9000',
              '1. open': '235.3100',
              '2. high': '239.9000',
              '2. high': '239.9000',
              '3. low': '230.3000',
              '4. close': '239.9000',
              '5. volume': '3452551'
            }
          }
      }
    } else if ( navn == "BA" ) {
      offlineResponseData = {
        'Meta Data': {
           '1. Information': 'Intraday (60min) open, high, low, close prices and volume',
           '2. Symbol': 'BA',
           '3. Last Refreshed': '2025-04-17 19:00:00',
           '4. Interval': '60min',
           '5. Output Size': 'Compact',
           '6. Time Zone': 'US/Eastern'
        },
        'Time Series (60min)': {
          '2025-04-17 19:00:00': {
            '1. open': '161.9000',
            '2. high': '162.6100',
            '3. low': '161.9000',
            '4. close': '162.2700',
            '5. volume': '828582'
          },
          '2025-04-17 18:00:00': {
            '1. open': '162.1000',
            '2. high': '162.6073',
            '3. low': '161.9000',
            '4. close': '162.3900',
            '5. volume': '835110'
          },
          '2025-04-17 17:00:00': {
            '1. open': '162.2100',
            '2. high': '162.5000',
            '3. low': '162.1000',
            '4. close': '162.1000',
            '5. volume': '3646'
          },
          '2025-04-17 16:00:00': {
            '1. open': '161.8900',
            '2. high': '162.6000',
            '3. low': '161.8300',
            '4. close': '162.3300',
            '5. volume': '2645223'
          },          
        }
      }
    } else if ( navn == "NVO") {
      offlineResponseData = {
        'Meta Data': {
          '1. Information': 'Intraday (60min) open, high, low, close prices and volume',
          '2. Symbol': 'TSLA',
          '3. Last Refreshed': '2025-04-17 19:00:00',
          '4. Interval': '60min',
          '5. Output Size': 'Compact',
          '6. Time Zone': 'US/Eastern'
        },
        'Time Series (60min)': {
          '2025-04-17 19:00:00': {
            '1. open': '238.8100',
            '2. high': '239.7900',
            '3. low': '236.2897',
            '4. close': '238.8300',
            '5. volume': '505465'
          },
          '2025-04-17 18:00:00': {
            '1. open': '240.3000',
            '2. high': '240.3000',
            '3. low': '238.8100',
            '4. close': '239.7900',
            '5. volume': '498384'
          },    
          '2025-04-09 19:00:00': {
            '1. open': '235.3100',
            '2. high': '239.9000',
            '3. low': '230.3000',
            '4. close': '236.9700',
            '5. volume': '1005263'
          },
          '2025-04-09 18:00:00': {
            '1. open': '235.7600',
            '2. high': '239.9000',
            '3. low': '230.3000',
            '4. close': '236.9900',
            '5. volume': '1005438'
          },
          '2025-04-09 16:00:00': {
            '1. open': '235.3100',
            '2. high': '239.9000',
            '1. open': '235.3100',
            '2. high': '239.9000',
            '2. high': '239.9000',
            '3. low': '230.3000',
            '4. close': '239.9000',
            '5. volume': '3452551'
          }
        }
      }
    } else if ( navn == "AAPL") {
      offlineResponseData = {
        'Meta Data': {
          '1. Information': 'Intraday (60min) open, high, low, close prices and volume',
          '2. Symbol': 'AAPL',
          '3. Last Refreshed': '2025-04-17 19:00:00',
          '4. Interval': '60min',
          '5. Output Size': 'Compact',
          '6. Time Zone': 'US/Eastern'
        },
        'Time Series (60min)': {
          '2025-04-17 19:00:00': {
            '1. open': '197.1500',
            '2. high': '197.4000',
            '3. low': '196.9800',
            '4. close': '197.3000',
            '5. volume': '819041'
          },
          '2025-04-17 18:00:00': {
            '1. open': '197.4000',
            '2. high': '197.5500',
            '3. low': '197.0000',
            '4. close': '197.1500',
            '5. volume': '14368'
          },
          '2025-04-17 17:00:00': {
            '1. open': '197.5900',
            '2. high': '199.6953',
            '3. low': '185.0045',
            '4. close': '197.5400',
            '5. volume': '55297'
          },
          '2025-04-17 16:00:00': {
            '1. open': '196.8700',
            '2. high': '198.0000',
            '3. low': '196.8700',
            '4. close': '197.4600',
            '5. volume': '16653073'
          }
        }
      }
    }
    res.json(offlineResponseData);
  }
});  
 
module.exports = router;
