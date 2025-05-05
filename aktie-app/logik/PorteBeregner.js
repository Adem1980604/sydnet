/* 
PortefoljeBeregner:
En klasse der kan lave alle beregninger til portefølje-funktionalitet
- GAK (gennemsnitlig købspris)
- Ejet antal
- Samlet værdi
- Urealiseret gevinst/tab
- Realiseret gevinst/tab  
- Samlet total værdi (kontanter + investeringer) 
- Top 5 værdipapirer baseret på værdi/profit
*/
const { sql, forbindDatabase } = require('../db');
const { query } = require('mssql');
require('dotenv').config(); // sørger for at tage fat i vores env fil



class PortefoljeBeregner {
    constructor(handler, konti = []) {
        this.handler = handler;  // Gemmer alle handler (køb og salg) brugeren har lavet
        this.konti =konti;       //  Gemmer alle brugerens konti med saldo
        this.ejerListe= []; // Liste over aktier brugeren ejer lige nu
        this.gakBeregning = [];  // Data til at beregne GAK på hver aktie
        this.ejerListeFiltreret = []; // Kun aktier hvor antal > 0 (ingen solgte)
        this.realiseretGevinst = 0; // Akkumulerer realiseret gevinst/tab
        this.ejerListeFiltreret = []; // Kun aktier hvor antal > 0 (ingen solgte væk)
        this.realiseretGevinst =0; // Akkumulerer realiseret gevinst/tab
    }

    // Metode: Beregner ejerliste og GAK for alle aktier
    beregnEjerOgGAK() {
        //console.log("****************handler************");
        //console.log(this.handler);
        // Sorter handler efter dato først 
        this.handler.sort((a,b) => new Date(a.datotid)-new Date(b.datotid));

        // Gennemgår alle handler (køb/salg)
        for (let i = 0; i < this.handler.length; i++) {
            const h = this.handler[i];  
            
           // console.log(h)   

            const symbol = h.symbol;
            const valuta =   h.valuta;
            const antal = h.antal;
            const pris =   h.pris;
            const salg_koeb =  h.salg_koeb; // false = køb, true = salg

            // 1: Find aktien i ejerlisten (hvis den findes)
            let ejerAktie = null;
            for (let j = 0; j < this.ejerListe.length; j++) {
                if (this.ejerListe[j].symbol === symbol) {
                    ejerAktie = this.ejerListe[j];
                    break;
                }
            }
            // Hvis ikke fundet, tilføj ny aktie til ejerliste
            if (!ejerAktie) {
                ejerAktie={symbol: symbol, antal: 0 };
                this.ejerListe.push(ejerAktie);
                 }
            // 2:hvoFind eller opret GAK beregning for aktien
            let gakAktie =null;
            for (let j = 0; j< this.gakBeregning.length; j++) {
                if (this.gakBeregning[j].symbol===symbol) {
                    gakAktie = this.gakBeregning[j];
                    break;
                    }
            }
            if ( !gakAktie) {
                gakAktie = {symbol,samletAntal:0,samletPris:0};
                this.gakBeregning.push(gakAktie);
            }
            // 3: Opdater ejerantal og GAK baseret på køb/salg
            if (salg_koeb === false) { // køb

                ejerAktie.antal+= antal;
                gakAktie.samletPris +=antal * pris;
                gakAktie.samletAntal += antal;
            } else {// salg
                ejerAktie.antal -=antal;

                if(gakAktie.samletAntal < antal){
                    throw new Error
                    (`Dette kan du ikke sælge du forsøger at sælge ${antal}, men ejer kun ${gakAktie.samletAntal}`);
                  }
                const gakIndenSalg =gakAktie.samletPris / gakAktie.samletAntal;
                gakAktie.samletPris-= gakIndenSalg * antal;
                gakAktie.samletAntal -=antal;

                // Beregn realiseret gevinst/tab for salget
                const realiseret =(pris -gakIndenSalg) * antal;
                this.realiseretGevinst+= realiseret;
            }
        }

        // Fjern aktier hvor antal = 0 (altså brugeren ejer dem ikke mere)
        this.ejerListeFiltreret =this.ejerListe.filter(e => e.antal > 0);

        // For hver aktie vi ejer:
        // Find den nyeste pris, navn og udregn GAK
        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i];

            // Find nyeste handel for aktien
            let senesteHandler = null;
            for (let j = 0; j < this.handler.length; j++) {
                if (this.handler[j].symbol===e.symbol) {
                    if (!senesteHandler || new Date(this.handler[j].dato) > new Date(senesteHandler.dato)) {
                        senesteHandler = this.handler[j];
                    }
                }
            }

            // Find Gennemsnitlig anskaffelseskurs GAK
            for (let j = 0; j < this.gakBeregning.length; j++) {
                if (this.gakBeregning[j].symbol === e.symbol) {
                    e.gak = this.gakBeregning[j].samletPris / this.gakBeregning[j].samletAntal;
                    //console.log("********this*************");
                    //console.log(this);
                }
            }

            // Hvis vi fandt en nyeste handel -> brug pris og navn
            if (senesteHandler) {
                e.pris= senesteHandler.pris;
                e.navn =senesteHandler.navn;
                e.portefolje_navn = senesteHandler.portefolje_navn;
            }

            // Find GAK
            for (let j = 0; j< this.gakBeregning.length; j++) {
                if (this.gakBeregning[j].symbol===e.symbol) {
                    e.gak = this.gakBeregning[j].samletPris/this.gakBeregning[j].samletAntal;
                    break;
                }
            }
        }
    }
    // Metode til at beregne totaler for hver portefølje
    beregnTotaler() {
        let totalErhvervelsespris =0; // hvad vi har betalt for aktien i alt
        let totalForventetVaerdi =0; // Hvad aktien er værd idag (markedspris)

        // går igennem alle værdipapir ( altså dem vi stadig ejer)
        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i];
            totalErhvervelsespris+=e.antal * e.gak;
            totalForventetVaerdi += e.antal * e.pris;// * valutakurs;
            //console.log("********e*******************");
            //console.log(e);
            //console.log("********totalErhvervelsespris*******************");
            //console.log(totalErhvervelsespris);
            //console.log("********totalForventetVaerdi*******************");
            //console.log(totalForventetVaerdi);            
        }
        
// console.log( totalErhvervelsespris)
//console.log( totalForventetVaerdi)
        // Beregn urealiseret gevinst/tab (profit minus hvad vi har betalt)
        const totalUrealiseretGevinstTab = totalForventetVaerdi - totalErhvervelsespris;

        return {
             totalErhvervelsespris,
            totalForventetVaerdi,
            totalUrealiseretGevinstTab,
               totalRealiseretGevinstTab: this.realiseretGevinst // Realiseret gevinst/tab
            };
    }

    //  Metode: til at beregne samlet værdi (kontanter + investeringer)
    beregnSamletVaerdi() {
        let kontanter = 0;
        for (let i = 0; i <this.konti.length; i++) {
            kontanter +=this.konti[i].saldo;
           }
        let investeringer = 0;
        for (let i= 0; i< this.ejerListeFiltreret.length; i++) {
            const e =this.ejerListeFiltreret[i];
            investeringer += e.antal*e.pris
        }
        return kontanter+investeringer;
         }

    // Top 5 værdipapirer baseret på markedsværdi
    topFemVaerdi() {
        const liste =[];

        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i]
            const vaerdi = e.antal * e.pris;
            liste.push({ navn: e.navn, symbol:e.symbol, antal: e.antal, vaerdi: vaerdi,portefolje_navn: e.portefolje_navn})
        }
// vi laver en bubble sort for at sørger for at største værdi ligger først 
        for (let i = 0; i < liste.length - 1; i++) {
            for (let j = i + 1; j <liste.length; j++) {
                    if(liste[j].vaerdi> liste[i].vaerdi){
                        let temp =liste[i];
                        liste[i]=liste[j]
                        liste[j]= temp;
                    }        
            }
            
        }

// Vi tager kun fat i top 5
        const top5 =[];
     for (let i = 0; i < liste.length && i < 5; i++) {
        top5.push(liste[i]);
        
     }
     //console.log(top5);
    
        return top5;
    }

    // Top 5 værdipapirer baseret på urealiseret gevinst
 
    topFemProfit() {
        const liste = [];
    
        // Først: beregn gevinst for hver aktie vi stadig ejer
        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i];
            const gevinst = (e.pris-e.gak) * e.antal;
    //console.log(e.symbol)
    //console.log(gevinst)

            liste.push({ navn: e.navn, symbol: e.symbol, gevinst: gevinst, antal: e.antal, portefolje_navn: e.portefolje_navn
            });
        }
    
        // Bubble sort: største gevinst øverst
        for (let i = 0; i< liste.length - 1; i++) {
            for (let j = 0; j <liste.length - 1 - i; j++) {
                if (liste[j].gevinst < liste[j + 1].gevinst) {
                    // Byt rundt
                const temp= liste[j];
            liste[j] =liste[j + 1];
            liste[j + 1] = temp;
                }
            }
}
    
        // Tag de 5 første (eller færre)
        const top5 = [];
        for (let i = 0; i < liste.length && i < 5; i++) {
            top5.push(liste[i]);
        }
//console.log(top5);

        return top5;
    }

};


module.exports = PortefoljeBeregner;



  