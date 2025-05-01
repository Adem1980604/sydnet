// Her testen vores valideringsfunktion i forskellige senarier. 

const { expect } = require('chai');
const { validerLoginInput } = require('../../ISOfunktioner/validering');

describe("validerLoginInput", () => {
  it("returnerer true når begge felter er udfyldt", () => {
    const resultat = validerLoginInput("sydnet", "sydnet1234");
    expect(resultat).to.be.true;
  });

  it("returnerer false hvis brugernavn mangler", () => {
    const resultat = validerLoginInput("", "sydnet1234");
    expect(resultat).to.be.false;
  });

  it("returnerer false hvis adgangskode mangler", () => {
    const resultat = validerLoginInput("sydnet", "");
    expect(resultat).to.be.false;
  });

  it("returnerer false hvis begge mangler", () => {
    const resultat = validerLoginInput("", "");
    expect(resultat).to.be.false;
  });
});
