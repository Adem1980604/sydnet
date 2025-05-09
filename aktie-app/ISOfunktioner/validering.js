// Her laves det en valideringsfunktion, altså vi tjekker om brugernavn og adgangkode begge to er udfyldt 

function validerLogIndInput(brugernavn, adgangskode) {
    if (!brugernavn || !adgangskode) {
      return false;
    }
    return true;
  }
  
  module.exports = {
    validerLogIndInput
  };
  