# Website-template — uitleg en gebruik

Deze template is gebouwd om **herhaaldelijk aan te passen en te verkopen** aan
lokale Nederlandse bedrijven. De opbouw is bewust simpel gehouden: puur
HTML, CSS en JavaScript, zonder build-stap, framework of node_modules.
Elk bestand kan direct op elke hostingpartij (of gratis op bv. Netlify,
Vercel of Cloudflare Pages) worden geplaatst.

## Bestandsstructuur

```
.
├── index.html                        ← HTML-skelet. Bevat GEEN bedrijfstekst.
├── css/
│   └── style.css                      ← Vormgeving. Kleuren/fonts komen uit config.js.
├── js/
│   ├── config.js                       ← ⭐ ALLE content & instellingen. Dit pas je aan.
│   ├── render.js                        ← Bouwt de HTML per sectie op uit config.js.
│   └── main.js                           ← Voegt alles samen en regelt interactie.
├── img/
│   └── favicon.svg
├── Dockerfile                        ← Bouwt een nginx-image met de website erin.
├── nginx.conf                        ← gzip + cache-headers.
├── docker-compose.yml                ← Haalt de kant-en-klare image op (géén build).
├── .github/workflows/
│   └── docker-publish.yml             ← Bouwt & publiceert de image automatisch naar ghcr.io.
└── README.md
```

**De regel:** bedrijfsinformatie staat precies één keer, in `js/config.js`.
Nergens anders in de code staat een bedrijfsnaam, telefoonnummer, kleur of
lettertype hardcoded.

## Snel een nieuwe klant opzetten

1. Maak een kopie van de map `site/`.
2. Open `js/config.js` en loop van boven naar beneden de secties door:
   bedrijfsgegevens, kleuren, lettertypes, hero, diensten, over ons, etc.
3. Vervang alle voorbeeldteksten en -afbeeldingen door de content van de
   nieuwe klant.
4. Pas `stijl.kleuren.primair` en `stijl.kleuren.accent` aan naar de
   huisstijlkleuren van de klant. De hele website (knoppen, links, hero,
   cta-band, cijfers) werkt automatisch mee.
5. Vervang de Google Fonts-link in `index.html` (in de `<head>`) als de
   klant andere lettertypes wenst, en zet dezelfde naam in
   `stijl.lettertypes` in `config.js`.
6. Pas de array `secties` onderin `config.js` aan: verwijder een regel om
   een sectie te verbergen, verplaats een regel om de volgorde te wijzigen.
7. Klaar. Open `index.html` in de browser om te controleren, en upload de
   hele map naar de hosting van de klant.

Er hoeft **niets** in `index.html`, `render.js` of `style.css` te worden
aangepast voor een gemiddelde nieuwe klant.

## Secties aan-, uit- of omzetten

Onderin `js/config.js` staat:

```js
secties: [
  "diensten",
  "over-ons",
  "waarom-wij",
  "portfolio",
  "reviews",
  "faq",
  "cta-band",
  "contact",
  "locatie",
],
```

- **Verwijderen:** haal de regel weg. Bijvoorbeeld: een fotograaf gebruikt
  misschien geen `"waarom-wij"`, maar wel een uitgebreide `"portfolio"`.
- **Volgorde wijzigen:** verplaats de regel. Een makelaar zet `"portfolio"`
  bijvoorbeeld liever direct na de hero, nog vóór `"diensten"`.
- `hero` staat altijd bovenaan en `footer` altijd onderaan; die hoef je
  hier niet op te nemen.

## Een unieke uitstraling per branche

Om te voorkomen dat elke website er identiek uitziet, hoeft er meestal maar
aan drie knoppen gedraaid te worden: **kleur, lettertype en sectievolgorde**.
Enkele startpunten:

| Branche | Primaire kleur | Sfeer | Aanpassing |
|---|---|---|---|
| Restaurant | `#7A2E2E` (bordeaux) | Warm, uitnodigend | Zet `portfolio` (als menu/sfeerfoto's) direct na hero |
| Kapper / schoonheidssalon | `#A8556B` of `#2E5C4B` | Fris, persoonlijk | Voeg extra reviews toe, laat `waarom-wij` vervallen |
| Garage | `#1F2937` (grafiet) + felgele accent | Stoer, technisch | Prijzen per dienst juist wél expliciet tonen |
| Aannemer / loodgieter | `#1E3A5F` of `#2F4B3C` | Betrouwbaar, degelijk | `waarom-wij` en garantie-punten benadrukken |
| Makelaar | `#0F2A3D` + goud-accent `#B08D57` | Chic, ruimtelijk | `portfolio`-grid gebruiken voor woningaanbod |
| Fotograaf | `#111111` + neutrale accent | Minimalistisch | `portfolio` groot en bovenaan, `diensten` compact |
| Lokale winkel | Merkkleur van de winkel | Toegankelijk | `faq` en `locatie` vroeg in de volgorde |

Wissel ook eens het lettertype `stijl.lettertypes.uitgelicht` (nu
"Fraunces", een sierlijke serif) voor iets steviger zoals "Space Grotesk"
of "Sora" bij een technische branche (garage, loodgieter) om echt een
ander karakter te krijgen zonder de code aan te raken.

## Een nieuwe sectie toevoegen

1. Schrijf in `render.js` een functie `renderJouwSectie(config)` die een
   HTML-string teruggeeft (kopieer een bestaande functie als voorbeeld).
2. Voeg de content ervoor toe aan `config.js`.
3. Voeg in `render.js`, onderin, `"jouw-sectie": renderJouwSectie` toe aan
   `SECTION_RENDERERS`.
4. Zet `"jouw-sectie"` op de gewenste plek in `config.secties`.

## Contactformulier

Het formulier valideert nu alleen aan de voorkant (verplichte velden,
geldig e-mailadres) en toont een bevestiging — er wordt nog **niets
daadwerkelijk verzonden**. Koppel voor een live website een van deze
opties in `js/main.js` (functie `initContactformulier`):

- Een formulierdienst zoals Formspree, Web3Forms of Basin (geen eigen
  server nodig, alleen het `action`-endpoint invullen).
- Een eigen backend-endpoint via `fetch()`.
- Een self-hosted mailscript op de hosting van de klant.

## Afbeeldingen

De voorbeeldafbeeldingen komen van Unsplash en zijn alleen bedoeld als
placeholder. Vervang de URL's in `config.js` door eigen, geoptimaliseerde
foto's (bij voorkeur `.webp`, max. ~200 KB per stuk) voor een snellere
laadtijd en betere SEO-score.

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
4. Push je toont meteen de workflow onder het tabblad **Actions**. Na een
   paar minuten staat de image onder **Packages** in je profiel/organisatie,
   als `ghcr.io/OWNER/REPO:latest`.
5. Standaard staat een nieuw package op **Private**. Zet 'm op **Public**
   via het package zelf → *Package settings*, of log op de server in met
   `docker login ghcr.io` (gebruikersnaam + [Personal Access Token](https://github.com/settings/tokens)
   met scope `read:packages`) als je 'm privé wilt houden.

**Bij elke volgende aanpassing** (nieuwe klant, tekstwijziging): commit en
push naar `main` → de workflow bouwt automatisch een nieuwe `latest`-image.
Wil je versies vasthouden, maak dan een git-tag zoals `v1.0.0`; de workflow
publiceert die dan ook als aparte, vaste tag naast `latest`.

## Draaien met Docker Compose (alleen pullen, niet bouwen)

`docker-compose.yml` bevat bewust géén `build:`-regel — het haalt uitsluitend
de kant-en-klare image op die de GitHub Actions-workflow heeft gepubliceerd.

1. Open `docker-compose.yml` en vervang `OWNER/REPO` door je eigen
   GitHub-gebruikersnaam/organisatie en repositorynaam (kleine letters).
2. Op de server (met Docker en Docker Compose geïnstalleerd):
   ```bash
   docker compose pull
   docker compose up -d
   ```
3. De website is bereikbaar op `http://<server-ip>:8080`. Pas de
   poorttoewijzing (`"8080:80"`) aan in `docker-compose.yml` indien gewenst.
4. Bij een nieuwe versie: `docker compose pull && docker compose up -d`
   haalt de nieuwste `latest`-image op en herstart de container — zonder
   dat er iets lokaal gebouwd wordt.

Wil je meerdere klantensites op dezelfde server draaien? Voeg per klant een
eigen `services:`-blok toe (met een eigen `image:`-tag en poort), of zet elke
klant in een eigen repository met eigen `docker-compose.yml`.

## SEO

- Titel en meta-omschrijving worden ingesteld via `config.seo` in
  `config.js` en automatisch in `<head>` geplaatst.
- Gebruik betekenisvolle `alt`-teksten bij elke afbeelding in `config.js`.
- Overweeg per klant een uniek `sitemap.xml` en `robots.txt` toe te voegen
  vóór livegang, en het domein te registreren in Google Search Console.
