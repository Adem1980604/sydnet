// Her testen vores valideringsfunktion i forskellige senarier. 

const {assert} = require('chai');
const { validerLogIndInput } = require('../../ISOfunktioner/validering');

describe("validerLogIndInput", function () {
  it("returnerer true når begge felter er udfyldt", function (){
    const resultat = validerLogIndInput("sydnet", "sydnet1234");
    assert.isTrue(resultat);
  });

  it("returnerer false hvis brugernavn mangler", function() {
       const resultat = validerLogIndInput("", "sydnet1234");
       assert.isFalse(resultat);
  });

  it("returnerer false hvis adgangskode mangler", function() {
      const resultat = validerLogIndInput("sydnet", "");
      assert.isFalse(resultat);
  });

   it("returnerer false hvis begge mangler", function() {
    const resultat = validerLogIndInput("", "");
    assert.isFalse(resultat);
  });
});
