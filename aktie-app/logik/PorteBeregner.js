/* 
PortefoljeBeregner:
En klasse der kan lave alle beregninger til portefølje-funktionalitet
- GAK (gennemsnitlig købspris)
- Ejet antal
- Samlet værdi
- Urealiseret gevinst/tab
*/


class PortefoljeBeregner {
    constructor(handler) {
        this.handler = handler;  // Gemmer alle handler (køb og salg) brugeren har lavet
        this.ejerListe = []; // Liste over aktier brugeren ejer lige nu
        this.gakBeregning = [];  // Data til at beregne GAK på hver aktie
        this.ejerListeFiltreret = []; // Kun aktier hvor antal > 0 (ingen solgte væk)
    }

    // Metode: Beregner ejerliste og GAK for alle aktier
    beregnEjerOgGAK() {
        // Gennemgår alle handler (køb/salg)
        for (let i = 0; i < this.handler.length; i++) {
            const h = this.handler[i];
            const symbol = h.symbol;
            const antal = h.antal;
            const pris = h.pris;
            const salg_koeb = h.salg_koeb; // false = køb, true = salg



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
                ejerAktie = { symbol: symbol, antal: 0 };
                this.ejerListe.push(ejerAktie);
            }


            // 2: Find eller opret GAK beregning for aktien
            let gakAktie = this.gakBeregning.find(g => g.symbol === symbol);
            if (!gakAktie) {
                gakAktie = { symbol, samletAntal: 0, samletPris: 0 };
                this.gakBeregning.push(gakAktie);
            }

            // 3: Opdater ejerantal og GAK baseret på køb/salg
            if (salg_koeb === false) { // køb
                ejerAktie.antal += antal;
                gakAktie.samletPris += antal * pris;
                gakAktie.samletAntal += antal;
            } else { // salg
                ejerAktie.antal -= antal;
                const gakIndenSalg = gakAktie.samletPris / gakAktie.samletAntal;
                gakAktie.samletPris -= gakIndenSalg * antal;
                gakAktie.samletAntal -= antal;
            }
        }

        // Fjern aktier hvor antal = 0 (altså brugeren ejer dem ikke mere)
        this.ejerListeFiltreret = this.ejerListe.filter(e => e.antal > 0);

        // For hver aktie vi ejer:
        // Find den nyeste pris, navn og udregn GAK
        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i];


            // Find nyeste handel for aktien       
            let senesteHandler = null;
            for (let j = 0; j < this.handler.length; j++) {
                if (this.handler[j].symbol === e.symbol) {
                    if (!senesteHandler || new Date(this.handler[j].dato) > new Date(senesteHandler.dato)) {
                        senesteHandler = this.handler[j];
                    }
                }
            }

            // Hvis vi fandt en nyeste handel -> brug pris og navn
            if (senesteHandler) {
                e.pris = senesteHandler.pris;
                e.navn = senesteHandler.navn;
            }

            // Find GAK
            for (let j = 0; j < this.gakBeregning.length; j++) {
                if (this.gakBeregning[j].symbol === e.symbol) {
                    e.gak = this.gakBeregning[j].samletPris / this.gakBeregning[j].samletAntal;
                    break;
                }
            }
        }
    }

    // Metode til at beregne totaler for hver portefølje 
    beregnTotaler() {
        let totalErhvervelsespris = 0; // hvad vi har betalt for aktien i alt
        let totalForventetVaerdi = 0; // Hvad aktien er værd idag (markedspris)


        // går igennem alle værdipapir ( altså dem vi stadig ejer)
        for (let i = 0; i < this.ejerListeFiltreret.length; i++) {
            const e = this.ejerListeFiltreret[i];
            totalErhvervelsespris += e.antal * e.gak;
            totalForventetVaerdi += e.antal * e.pris;
        }

        // Beregn urealiseret gevinst/tab (profit minus hvad vi har betalt)
        const totalUrealiseretGevinstTab = totalForventetVaerdi - totalErhvervelsespris;

        return {
            totalErhvervelsespris,
            totalForventetVaerdi,
            totalUrealiseretGevinstTab
        };
    }
}

module.exports = PortefoljeBeregner;
