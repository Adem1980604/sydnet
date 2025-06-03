
const express = require('express'); //Gør at man kan lave en hjemmeside, hvor alt kan snakke sammen
const app = express();

const path = require('path'); //Giver dig mulighed for at arbejde med flere forskellige filer/fil struktur
app.set('case sensitive routing', false); //Ikke case sensitive json
const session = require('express-session'); //Gør at vi kan arbejde med sessions



const port = 4000; //Serveren kører på denne port


// her sætter vi EJS som template, så vi kan bruge "dynamiske" HTML-sider
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// session sørger for at der huskes hvem brugeren er så du kan knytte dem til fx en konto eller en indsættelse
app.use(session({
    secret: 'sydnet123',  // Hemmelig nøgle til at kryptere sessions
    resave: false,         // Gem ikke sessioner igen, hvis de ikke er ændret
    saveUninitialized: true, // Gem nye tomme sessioner (bruges ved log-ind)
//    cookie: { secure: false } // Tillad cookies uden HTTPS (til lokal udvikling (tror jeg))
}));

// dette håndere vores JSON-data altså POST request
app.use(express.json());

// Gør det muligt for hjemmesiden at bruge filer som CSS og JavaScript.
app.use(express.static('public'));

// vi sætter ROUTES op for LOG-IND page(Hvilket er vores main page)
app.get('/', function (req, res) {
    res.render('bruger-sider/log-ind')
});



//*******************API kald data route*********/
const dataRouter = require('./routers/aktiesoeg');
app.use('/aktiesoeg', dataRouter);



// impoter routerne
const brugerRuter = require('./routers/bruger');
const portefoljeRuter = require('./routers/portefoljestyring');
const kontoRouter = require('./routers/portefoljestyring'); 
//const dashboardRouter = require('./routers/bruger');




app.use('/bruger', brugerRuter);
app.use('/portefoljestyring', portefoljeRuter);
app.use('/', kontoRouter);   
//app.use('/', dashboardRouter);


//res.status(200).json();

// vi starter vores server og tjekker at den virker, ved console.log
app.listen(port, () => { //Gør at porten er åben og lytter
    console.log(`app listening on port ${port}`) //Tekst i konsollen
});





