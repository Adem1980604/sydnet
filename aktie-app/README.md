# Sydnet

# Install
npm install,(npm start?) samt npm install axios, hvis vi sletter node_modules
Express, mysql, chart.js og har vi også installeret(Dog ser det ud til at de kun har påvirket vores package-lock.json og package.json filer)

# API-KEY
Husk at tilføje jeres egen aktiekurs API-key! Dette gør I i filen "aktiesoeg.js" på linje 9
I kan også tilføje jeres egen valutakurs API-key(Dog kan der stadig fortages over 1000 forspørgsler på den nuværende). Dette gør I i filen "aktiesoeg.js" linje 3321

Hvis I selv har en API-key, hvor I har et ubegrænset antal forespørgsler, og har sat den ind i "aktiesoeg.js", så er de næste 4 linjer ikke relevant:

Vores side kan enten operere med live eller offlinedata. Offlinedata kan tages i brug, i tilfælde at man ikke har flere forespørgler tilbage på sin API-key.
Man kan slå live til ved at sætte variablen "live" til true, eller offline til ved at sætte "live" til false.(aktiesoeg.js - linje 23(for aktiekurs) og 3321(for valutakurs)). Dog skal man være opmærksom, hvis man skifter mellem live og offline, da man kun kan tilgå et bestemt antal aktier via offlinedata. I kan læse mere om dette i vores rapport under afsnittet "Live vs Offlinedata".

# Connect database
I kan connecte til databasen enten ved at ændre i .env filen, og sætte denne fil op med info fra jeres egen database, eller I kan gøre brug af vores database. Dette kan I gøre via den nederstående URL som kan sættes.

eller via info opgivet i .env filen:
[jdbc:sqlserver://aktie-app.database.windows.net:1433;database=sydnet;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;]

# Kør database setup
Derefter skal i køre "node lavDB.js" i terminalen i VS.

# Start server og gå til browser
For at starte serveren, skal I starte med at skrive "cd aktie-app" og derefter "node app.js". 
Herefter vil serveren køre, og I kan nu søge på http://localhost:4000/ for at gå til forsiden som er vores log-ind side.