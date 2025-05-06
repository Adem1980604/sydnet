// Her testen vores valideringsfunktion i forskellige senarier. 

const {assert} = require('chai');
const { validerLoginInput } = require('../../ISOfunktioner/validering');

describe("validerLoginInput", function () {
  it("returnerer true når begge felter er udfyldt", function (){
    const resultat = validerLoginInput("sydnet", "sydnet1234");
    assert.isTrue(resultat);
  });

  it("returnerer false hvis brugernavn mangler", function() {
       const resultat = validerLoginInput("", "sydnet1234");
       assert.isFalse(resultat);
  });

  it("returnerer false hvis adgangskode mangler", function() {
      const resultat = validerLoginInput("sydnet", "");
      assert.isFalse(resultat);
  });

   it("returnerer false hvis begge mangler", function() {
    const resultat = validerLoginInput("", "");
    assert.isFalse(resultat);
  });
});
