// vi tester med en "fake" database hvor vores testcase er på en konto ID på 1 med en saldo på 1500

const {assert} = require('chai');
const {hentSaldo} = require('../../ISOfunktioner/konto');

describe("hentSaldo", function () {
  it("returnerer korrekt saldo fra fake db", async function() {
// vi laver en fake DB forbindelse med det samme struktur som vores normale DB
    const fakeDb = {
      request: function () { // vi starter en sql request 
        return {
        input: function () { // her tilføjer vi vores konto_id = konto_id  det der bliver sat ind er .input('konto_id', konto_id)
          return {
          query: async function(){ // sender sql query det der bliver sat ind her er query(`SELECT saldo FROM konto.kontooplysninger WHERE konto_id = @konto_id`);
    
            return ({recordset:[{ saldo: 1500}]})
          }
        };
      }
    };
  }
};
// vi kalder på hentsaldo med vores fake db hvor vi siger id =1 
    const saldo = await hentSaldo(fakeDb, 1);
    // dette er vores saldo forventning 
    assert.equal(saldo, 1500);
  });
});



