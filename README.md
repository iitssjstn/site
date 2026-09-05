# Website-template met admin-paneel — uitleg en gebruik

Deze template is gebouwd om **herhaaldelijk aan te passen en te verkopen** aan
lokale Nederlandse bedrijven. De website zelf is pure HTML/CSS/JS; een kleine
Node-server eromheen serveert de site, een **admin-paneel** en een API zodat
tekst, kleuren en afbeeldingen aangepast kunnen worden zonder in code te
duiken. Je zet het één keer op voor een klant; de klant kan daarna zelf
teksten en prijzen bijwerken via `/admin`.

## ⚠️ Beveiliging — lees dit eerst

**Er zit op uitdrukkelijk verzoek geen inlog/wachtwoord op het admin-paneel.**
Iedereen die het adres kent (bijvoorbeeld `jouwdomein.nl/admin`) kan de inhoud
van de website aanpassen — er is geen gebruikersnaam, wachtwoord of token.
Overweeg in elk geval één van deze twee simpele opties zodra de site online
staat:

- **Reverse-proxy basic auth** — als je al Nginx, Traefik of Caddy voor de
  site gebruikt, is een wachtwoordje via Basic Auth een kwestie van een paar
  regels config, zonder dat de code van deze template hoeft te veranderen.
- **IP-allowlist** — sta `/admin` alleen toe vanaf het kantoor-IP van de klant
  of jouw eigen IP.

Zonder een van deze maatregelen staat het admin-paneel gewoon open voor
iedereen die de URL raadt of vindt.

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
│   ├── index.html
│   ├── admin.css
│   └── admin.js                  ← Formulier gegenereerd uit één schema
├── data/
│   └── config.json               ← Alle bedrijfsinhoud — dit bewerk je (via /admin of direct)
├── server/
│   ├── index.js                   ← Express-server: serveert site, admin-paneel én de config-API
│   └── package.json
├── Dockerfile                    ← Bouwt een image met server + site + admin-paneel
├── .github/workflows/
│   └── docker-publish.yml         ← Bouwt & publiceert de image automatisch naar ghcr.io
└── README.md
```

**Hoe het samenhangt:** `public/js/main.js` haalt bij het laden van de
website de inhoud op bij `GET /api/config`. Het admin-paneel (`/admin`) toont
diezelfde inhoud in een bewerkbaar formulier en stuurt wijzigingen terug naar
`PUT /api/config`. De server (`server/index.js`) schrijft dat weg naar
`data/config.json` — er is geen database nodig.

## Snel een nieuwe klant opzetten

1. Vervang vóór de eerste deploy de voorbeeldinhoud in `data/config.json`
   door de content van de nieuwe klant (of laat de voorbeeldinhoud staan en
   pas alles later aan via `/admin` — beide werken).
2. Bouw en publiceer de image (zie hieronder, via GitHub Actions).
3. Draai de container op de server van de klant.
4. Ga zelf naar `jouwdomein.nl/admin`, controleer/vul alle secties aan
   (bedrijfsgegevens, kleuren, hero, diensten, etc.) en klik op **Opslaan**.
5. Geef de klant het `/admin`-adres. Die kan vanaf nu zelf teksten, prijzen,
   openingstijden, reviews en de FAQ bijwerken — zonder jou erbij nodig te
   hebben.

Voor kleurenkeuzes, lettertype-ideeën en sectievolgorde per branche
(restaurant, kapper, garage, makelaar, etc.), zie de tabel verderop in dit
bestand.

## Het admin-paneel gebruiken

Open `/admin` in de browser. Elke sectie is inklapbaar; klik op een
sectiekop om 'm te openen. Lijsten (diensten, reviews, FAQ, portfolio,
openingstijden, ...) hebben een **+ toevoegen**-knop en per item knoppen om
te verplaatsen (↑ ↓) of te verwijderen (✕). Klik onderaan (of rechtsboven)
op **Opslaan** om de wijzigingen live te zetten — de wijziging is direct
zichtbaar op de website, geen herstart of nieuwe deploy nodig.

De sectie **Sectievolgorde** bepaalt welke onderdelen van de pagina getoond
worden en in welke volgorde (behalve hero en footer, die staan altijd vast
boven- en onderaan).

## Handmatig `data/config.json` bewerken

Wil je liever direct het bestand bewerken (bijvoorbeeld voor een grote
eerste vulling)? Dat kan altijd naast het admin-paneel: pas
`data/config.json` aan en herstart de container. Zorg dat het geldig JSON
blijft (dubbele aanhalingstekens, geen trailing comma's).

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

Lettertype wisselen kan ook via `/admin` → Huisstijl: vervang bijvoorbeeld
"Fraunces" (sierlijke serif) door iets steviger zoals "Space Grotesk" of
"Sora" bij een technische branche. Let op: het lettertype moet ook als
Google Fonts-link in `public/index.html` staan (in de `<head>`) — die regel
pas je één keer aan bij het opzetten van een nieuwe klant.

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
workflow bouwt automatisch een nieuwe `latest`-image. Let op: dit is voor
wijzigingen aan de **code** (nieuwe secties, andere styling). Content
(teksten, prijzen, kleuren) wijzig je via `/admin` — dat vraagt geen nieuwe
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
      - website-data:/app/data   # bewaart config.json (en dus alle admin-wijzigingen)

volumes:
  website-data:
```

Belangrijk: de `volumes:`-regel is **niet optioneel**. Zonder deze volume
wordt `data/config.json` bij elke nieuwe `docker compose pull` teruggezet
naar de standaardinhoud uit de image, en ben je alle wijzigingen via
`/admin` kwijt.

1. Vervang `OWNER/REPO` door je eigen GitHub-gebruikersnaam/organisatie en
   repositorynaam (kleine letters).
2. Op de server:
   ```bash
   docker compose pull
   docker compose up -d
   ```
3. De website is bereikbaar op `http://<server-ip>:8080`, het admin-paneel
   op `http://<server-ip>:8080/admin`.
4. Bij een nieuwe codeversie: `docker compose pull && docker compose up -d`.
   De content in de `website-data`-volume blijft daarbij behouden.

## Contactformulier

Het formulier valideert nu alleen aan de voorkant (verplichte velden,
geldig e-mailadres) en toont een bevestiging — er wordt nog **niets
daadwerkelijk verzonden**. Koppel voor een live website een van deze
opties in `public/js/main.js` (functie `initContactformulier`):

- Een formulierdienst zoals Formspree, Web3Forms of Basin (geen eigen
  server nodig, alleen het `action`-endpoint invullen).
- Een eigen backend-endpoint via `fetch()` — je hebt de server al draaien,
  dus een extra route in `server/index.js` (bv. die de melding doorstuurt
  naar e-mail) is ook goed te doen.

## Afbeeldingen

De voorbeeldafbeeldingen komen van Unsplash en zijn alleen bedoeld als
placeholder. Vervang de URL's via `/admin` door eigen, geoptimaliseerde
foto's (bij voorkeur `.webp`, max. ~200 KB per stuk) voor een snellere
laadtijd en betere SEO-score.

## SEO

- Titel en meta-omschrijving stel je in via `/admin` → SEO.
- Gebruik betekenisvolle alt-teksten bij elke afbeelding (ook via `/admin`
  in te vullen, bij Hero en Over ons).
- Overweeg per klant een uniek `sitemap.xml` en `robots.txt` toe te voegen
  vóór livegang, en het domein te registreren in Google Search Console.
