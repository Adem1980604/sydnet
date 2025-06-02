//vi tester om den rigtige saldo bliver hentet ned til den specifikke konto 

// logiken findes i koden på portefoljestyring.js linje 470 
const hentSaldo = async function(db, konto_id) {
    const result = await db.request()
      .input('konto_id', konto_id)
      .query(` SELECT saldo FROM konto.kontooplysninger WHERE konto_id = @konto_id`);
    
    return result.recordset[0].saldo;
  };
  
  module.exports = {hentSaldo};
  