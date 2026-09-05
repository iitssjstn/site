# Website-template met beveiligd admin-paneel — uitleg en gebruik

Deze template is gebouwd om **herhaaldelijk aan te passen en te verkopen** aan
lokale Nederlandse bedrijven. De website zelf is pure HTML/CSS/JS; een kleine
Node-server eromheen serveert de site, een **beveiligd admin-paneel** en een
API zodat tekst, kleuren, foto's en accounts beheerd kunnen worden zonder in
code te duiken. Je zet het één keer op voor een klant (inclusief je eigen
beheerder-account); de klant kan daarna zelf teksten en prijzen bijwerken via
`/admin`, met een eigen account en eigen rol.

## Architectuur

```
.
├── public/                      ← De website zelf (statisch, geen build-stap)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── render.js             ← Bouwt HTML per sectie op uit de config
│       └── main.js                ← Haalt config op bij /api/config en rendert de pagina
├── admin/                       ← Het admin-paneel, bereikbaar op /admin
│   ├── index.html                 ← Het beheerformulier (alleen na inloggen)
│   ├── login.html / login.js       ← Inlogpagina
│   ├── setup.html / setup.js        ← Eenmalige eerste-account-setup
│   ├── admin.css
│   └── admin.js                     ← Formulier gegenereerd uit één schema
├── data/
│   ├── config.json               ← Alle bedrijfsinhoud — dit bewerk je (via /admin of direct)
│   ├── uploads/                   ← Geüploade foto's (via het admin-paneel)
│   ├── users.json                 ← Accounts + rollen (wachtwoorden gehasht) — NIET in git
│   └── session-secret.txt         ← Automatisch gegenereerd, NIET in git
├── server/
│   ├── index.js                   ← Express-server: site, admin-paneel, config-, upload- en auth-API
│   └── package.json
├── Dockerfile                    ← Bouwt een image met server + site + admin-paneel
├── .github/workflows/
│   └── docker-publish.yml         ← Bouwt & publiceert de image automatisch naar ghcr.io
└── README.md
```

**Hoe het samenhangt:** `public/js/main.js` haalt bij het laden van de
website de inhoud op bij `GET /api/config` (dit endpoint is publiek — elke
bezoeker van de site heeft dit nodig). Het admin-paneel (`/admin`) toont
diezelfde inhoud in een bewerkbaar formulier, maar is zelf **niet** publiek:
je moet ingelogd zijn. Wijzigingen worden teruggestuurd naar
`PUT /api/config` (vereist inlog) en weggeschreven naar `data/config.json`.

## Beveiliging: accounts, rollen en de eerste keer opstarten

Er is nu een volwaardig login-systeem, met twee rollen:

- **admin** — kan alle content bewerken én accounts beheren (aanmaken/verwijderen).
- **editor** — kan alle content bewerken, maar geen accounts beheren. Dit is
  de rol die je aan een klant geeft.

### Eerste keer opstarten

Zolang er nog geen enkel account bestaat, stuurt de server iedereen die naar
`/admin` gaat automatisch door naar een eenmalige **setup-pagina**
(`/admin/setup.html`). Daar maak je het eerste account aan — dit wordt
altijd automatisch een **admin**-account. Zodra dat account bestaat, is de
setup-pagina niet meer bruikbaar (de server geeft dan een foutmelding terug
als iemand 'm alsnog probeert te gebruiken).

**Aanbevolen volgorde bij een nieuwe klant:**
1. Start de container voor het eerst.
2. Ga zelf naar `jouwdomein.nl/admin` → je komt in de setup-pagina terecht →
   maak jouw eigen admin-account aan.
3. Log in, vul de content in (of pas de voorbeeldinhoud aan).
4. Open in het admin-paneel de sectie **Gebruikersbeheer** (helemaal
   onderaan, alleen zichtbaar voor admins) en maak daar een **editor**-account
   voor de klant aan.
5. Geef de klant hun eigen inloggegevens. Zij zien geen "Gebruikersbeheer"-
   sectie en kunnen dus geen andere accounts aanmaken of verwijderen — alleen
   content bewerken.

### Gebruikersbeheer

In de sectie **Gebruikersbeheer** (alleen zichtbaar voor admins) kun je:
- alle bestaande accounts zien, met hun rol;
- een nieuw account toevoegen (gebruikersnaam, wachtwoord, rol);
- een account verwijderen.

Wijzigingen hier zijn direct actief — er is geen aparte "Opslaan"-knop voor
nodig, in tegenstelling tot de content-secties.

Ingebouwde veiligheidsgrendels: je kunt je **eigen** account niet
verwijderen terwijl je ingelogd bent, en je kunt de **laatste** admin niet
verwijderen (zodat je nooit buitengesloten raakt).

### Wachtwoord vergeten / opnieuw beginnen

Er is bewust geen "wachtwoord vergeten"-mailflow (dat vraagt om een
mailserver, wat voor dit soort kleine sites overkill is). Ben je een
wachtwoord kwijt?
- Als admin: log in met een ander admin-account (als dat bestaat) en maak
  een nieuw account aan, verwijder het oude.
- Ben je alle toegang kwijt: verwijder `data/users.json` op de server (of in
  de volume) en herstart de container. De setup-pagina wordt dan opnieuw
  actief en je kunt een nieuw eerste account aanmaken. Let op: dit verwijdert
  *alle* bestaande accounts, niet alleen die van jou.

### Hoe de beveiliging technisch werkt (kort)

- Wachtwoorden worden gehasht met bcrypt — er wordt nergens een wachtwoord
  in leesbare vorm bewaard.
- Sessies zijn ondertekende cookies (geen sessie-database nodig). De
  ondertekeningssleutel staat in `data/session-secret.txt`, automatisch
  gegenereerd bij de eerste start. Verwijder je dat bestand, dan worden alle
  bestaande sessies ongeldig (iedereen moet opnieuw inloggen) — verder
  onschadelijk.
- `GET /api/config` blijft bewust **publiek** — dat is dezelfde inhoud die
  toch al zichtbaar is voor iedere bezoeker van de website. Alleen het
  *wijzigen* van content, uploaden van bestanden en gebruikersbeheer vereisen
  inloggen.

## Het admin-paneel gebruiken

Open `/admin` in de browser (log in of doorloop de eenmalige setup). Elke
sectie is inklapbaar; klik op een sectiekop om 'm te openen. Lijsten
(diensten, reviews, FAQ, portfolio, openingstijden, ...) hebben een
**+ toevoegen**-knop en per item knoppen om te verplaatsen (↑ ↓) of te
verwijderen (✕). Klik rechtsboven op **Opslaan** om content-wijzigingen live
te zetten — direct zichtbaar op de website, geen herstart nodig.

De sectie **Sectievolgorde** bepaalt welke onderdelen van de pagina getoond
worden en in welke volgorde (behalve hero en footer, die staan altijd vast
boven- en onderaan).

### Reviews verwijderen én later terugzetten (archief)

Bij **Klantbeoordelingen** verwijdert de ✕-knop een review niet definitief,
maar **archiveert** 'm: de tekst blijft bewaard in een apart, inklapbaar
"Gearchiveerd"-blokje onderaan die sectie. Wil je een review later weer
laten zien? Klap het archief open en klik op **↩ Terugzetten** — de review
verschijnt weer (onderaan) in de live lijst. Zo kan de klant zelf naar hun
zin schuiven met welke reviews wél en niet zichtbaar zijn, zonder ooit de
oorspronkelijke tekst kwijt te raken. Vergeet niet op **Opslaan** te klikken
na het archiveren/terugzetten — het zijn gewone content-wijzigingen.

### Foto's uploaden

Bij elk afbeeldingsveld (hero, over ons, portfolio-projecten, logo) staat
naast het URL-veld een knop **Bestand kiezen...**. Bestand selecteren, even
wachten op "Geüpload ✓", klaar — geen losse hosting of URL's plakken nodig.

- Toegestaan: JPG, PNG, WEBP, GIF en SVG, max. 8 MB per bestand.
- Geüploade bestanden komen in `data/uploads/` terecht — dezelfde map/volume
  als `config.json`, dus ze overleven ook een nieuwe image-versie.
- Uploaden vereist inloggen (elke rol, admin of editor).
- Een niet meer gebruikte upload wordt niet automatisch verwijderd. Bij een
  enkele klantsite met een handvol foto's is dat verwaarloosbaar; loopt de
  map vol, dan kun je `data/uploads/` gewoon opschonen (bestanden die nog in
  `data/config.json` genoemd worden even laten staan).

## Een unieke uitstraling per branche

Om te voorkomen dat elke website er identiek uitziet, hoeft er meestal maar
aan drie knoppen gedraaid te worden: **kleur, lettertype en sectievolgorde**
— allemaal aan te passen via `/admin`, zonder de code aan te raken.

| Branche | Primaire kleur | Sfeer | Aanpassing |
|---|---|---|---|
| Restaurant | `#7A2E2E` (bordeaux) | Warm, uitnodigend | Zet Portfolio (als menu/sfeerfoto's) direct na de hero |
| Kapper / schoonheidssalon | `#A8556B` of `#2E5C4B` | Fris, persoonlijk | Extra reviews toevoegen, "Waarom wij" desgewenst weglaten |
| Garage | `#1F2937` (grafiet) + felgele accent | Stoer, technisch | Prijzen per dienst juist wél expliciet tonen |
| Aannemer / loodgieter | `#1E3A5F` of `#2F4B3C` | Betrouwbaar, degelijk | "Waarom wij" en garantie-punten benadrukken |
| Makelaar | `#0F2A3D` + goud-accent `#B08D57` | Chic, ruimtelijk | Portfolio-grid gebruiken voor woningaanbod |
| Fotograaf | `#111111` + neutrale accent | Minimalistisch | Portfolio groot en bovenaan, Diensten compact |
| Lokale winkel | Merkkleur van de winkel | Toegankelijk | FAQ en Locatie vroeg in de volgorde |

Lettertype wisselen kan ook via `/admin` → Huisstijl. Let op: het lettertype
moet ook als Google Fonts-link in `public/index.html` staan (in de `<head>`)
— die regel pas je één keer aan bij het opzetten van een nieuwe klant.

## Uploaden naar GitHub + automatisch bouwen

Deze repository bevat een GitHub Actions-workflow
(`.github/workflows/docker-publish.yml`) die bij elke push naar `main` de
Docker-image bouwt en publiceert naar de **GitHub Container Registry**
(`ghcr.io`) — je hoeft zelf nooit `docker build` te draaien.

**Eenmalig instellen:**

1. Maak op GitHub een nieuwe (lege) repository aan.
2. Push deze map ernaartoe:
   ```bash
   git init
   git add .
   git commit -m "Eerste versie website-template"
   git branch -M main
   git remote add origin https://github.com/OWNER/REPO.git
   git push -u origin main
   ```
3. Ga naar **Settings → Actions → General → Workflow permissions** en zet
   dit op **"Read and write permissions"** (nodig zodat de workflow naar
   ghcr.io mag publiceren met de automatische `GITHUB_TOKEN`).
4. Na de push loopt de workflow onder het tabblad **Actions**. Na een paar
   minuten staat de image onder **Packages**, als `ghcr.io/OWNER/REPO:latest`.
5. Standaard staat een nieuw package op **Private**. Zet 'm op **Public**
   via het package zelf → *Package settings*, of log op de server in met
   `docker login ghcr.io` (gebruikersnaam + [Personal Access Token](https://github.com/settings/tokens)
   met scope `read:packages`) als je 'm privé wilt houden.

**Bij elke volgende codewijziging:** commit en push naar `main` → de
workflow bouwt automatisch een nieuwe `latest`-image. Content (teksten,
prijzen, kleuren, accounts) wijzig je via `/admin` — dat vraagt geen nieuwe
build of push.

## Draaien met Docker Compose (alleen pullen, niet bouwen)

Dit `docker-compose.yml` staat niet in de repository (dat hoeft niet — het
leeft op de server zelf), maar ziet er zo uit:

```yaml
services:
  website:
    image: ghcr.io/OWNER/REPO:latest
    container_name: website-template
    restart: unless-stopped
    pull_policy: always
    ports:
      - "8080:80"
    volumes:
      - website-data:/app/data   # bewaart config.json, accounts en geüploade foto's

volumes:
  website-data:
```

Belangrijk: de `volumes:`-regel is **niet optioneel**. Zonder deze volume
verlies je bij elke nieuwe `docker compose pull` niet alleen de content,
maar ook alle aangemaakte accounts (`data/users.json`) en de sessiesleutel.

1. Vervang `OWNER/REPO` door je eigen GitHub-gebruikersnaam/organisatie en
   repositorynaam (kleine letters).
2. Op de server:
   ```bash
   docker compose pull
   docker compose up -d
   ```
3. De website is bereikbaar op `http://<server-ip>:8080`, het admin-paneel
   op `http://<server-ip>:8080/admin` (stuurt bij een verse install
   automatisch door naar de setup-pagina).
4. Bij een nieuwe codeversie: `docker compose pull && docker compose up -d`.
   Content, accounts en uploads in de `website-data`-volume blijven behouden.

## Contactformulier

Het formulier valideert nu alleen aan de voorkant (verplichte velden,
geldig e-mailadres) en toont een bevestiging — er wordt nog **niets
daadwerkelijk verzonden**. Koppel voor een live website een van deze
opties in `public/js/main.js` (functie `initContactformulier`):

- Een formulierdienst zoals Formspree, Web3Forms of Basin (geen eigen
  server nodig, alleen het `action`-endpoint invullen).
- Een eigen backend-endpoint via `fetch()` — je hebt de server al draaien,
  dus een extra route in `server/index.js` is ook goed te doen.

## SEO

- Titel en meta-omschrijving stel je in via `/admin` → SEO.
- Gebruik betekenisvolle alt-teksten bij elke afbeelding (ook via `/admin`
  in te vullen, bij Hero en Over ons).
- Overweeg per klant een uniek `sitemap.xml` en `robots.txt` toe te voegen
  vóór livegang, en het domein te registreren in Google Search Console.
