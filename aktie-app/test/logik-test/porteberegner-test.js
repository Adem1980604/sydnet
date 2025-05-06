// Her tester vi vores beregnGAK metode fra vores klasse altså om den faktisk udregner det rigtige antal og GAK ved køb og salg 

const {assert} = require("chai");
const PortefoljeBeregner = require('../../logik/PorteBeregner');


describe("PortefoljeBeregner", function() {
  it("beregner korrekt antal og GAK efter køb og salg", function()  {
    
    const handler = [
      {
        symbol: "AAPL",
        antal: 10,
        pris: 100,
        salg_koeb: false, // køb
        datotid: new Date("2025-01-01"),
      },
      
      {
        symbol: "AAPL",
        antal: 5,
        pris: 200,
        salg_koeb: false, // køb
        datotid: new Date("2025-02-01"),
      },
      {
        symbol: "AAPL",
        antal: 5,
        pris: 250,
        salg_koeb: true, // salg
        datotid: new Date("2025-03-01"),
      },
    ];

    const beregner = new PortefoljeBeregner(handler);
    beregner.beregnEjerOgGAK();

    const aktie = beregner.ejerListeFiltreret[0];

    // Efter køb: (10*100 + 5*200) = 2000 / 15 = GAK 133.33
      // Efter salg af 5: tilbage 10 stk, GAK stadig 133.33
    
   assert.equal(aktie.symbol,"AAPL");
   assert.equal(aktie.antal, 10);
   assert.closeTo(aktie.gak, 133.33, 0.01);
  });
});
