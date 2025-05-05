// vi tester med en "fake" database hvor vores testcase er på en konto ID på 1 med en saldo på 1500

const { expect } = require('chai');
const { hentSaldo } = require('../../ISOfunktioner/konto');

describe("hentSaldo", () => {
  it("returnerer korrekt saldo fra fake db", async function() {
    const fakeDb = {
      request: () => ({
        input: () => ({
          query: async () => ({recordset:[{ saldo: 1500}]})
        })
      })
    };

    const saldo = await hentSaldo(fakeDb, 1);
    expect(saldo).to.equal(1500);
  });
});

//  chai http diskussion at vi bruger den almindelig require  
