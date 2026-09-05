/**
 * ============================================================================
 *  RENDER.JS
 * ============================================================================
 *  Elke functie hieronder bouwt de HTML voor één sectie, puur op basis van
 *  de data uit config.js. Er staat geen bedrijfsspecifieke tekst in dit
 *  bestand — wil je tekst aanpassen, doe dat in js/config.js.
 *
 *  Voeg je een nieuwe sectie toe? Schrijf een functie "renderX(config)" die
 *  een HTML-string teruggeeft, en voeg "x" toe aan de kaart SECTION_RENDERERS
 *  onderaan dit bestand.
 * ============================================================================
 */

// Kleine helper om gebruikersinvoer/tekst veilig in HTML te plaatsen.
function escapeHtml(tekst) {
  const div = document.createElement("div");
  div.textContent = tekst == null ? "" : String(tekst);
  return div.innerHTML;
}

function sterrenHtml(score) {
  const volledig = Math.round(score);
  return "★★★★★☆☆☆☆☆".slice(5 - volledig, 10 - volledig);
}

function initialen(naam) {
  return naam
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((deel) => deel[0].toUpperCase())
    .join("");
}

// ---------------------------------------------------------------- Header
function renderHeader(config) {
  const { bedrijf, navigatie, navigatieKnop } = config;
  const logo = bedrijf.logoAfbeelding
    ? `<img src="${escapeHtml(bedrijf.logoAfbeelding)}" alt="${escapeHtml(bedrijf.naam)}">`
    : escapeHtml(bedrijf.logoTekst || bedrijf.naam);

  const links = navigatie
    .map((item) => `<a href="${escapeHtml(item.link)}">${escapeHtml(item.label)}</a>`)
    .join("");

  return `
    <div class="container nav">
      <a href="#top" class="nav-logo">${logo}</a>
      <nav class="nav-links" id="nav-links">${links}</nav>
      <div class="nav-rechts">
        <a href="${escapeHtml(navigatieKnop.link)}" class="knop knop--primair knop--klein nav-cta-desktop">${escapeHtml(navigatieKnop.tekst)}</a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Menu openen" aria-expanded="false" aria-controls="nav-links">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>`;
}

// ------------------------------------------------------------------- Hero
function renderHero(config) {
  const h = config.hero;
  const titel = h.titelRegels.map((regel) => escapeHtml(regel)).join("<br>");
  return `
    <section class="hero sectie sectie--geen-lijn" id="top">
      <div class="container">
        <div class="hero-inhoud">
          <h1 class="hero-titel">${titel}</h1>
          <p class="hero-tekst">${escapeHtml(h.tekst)}</p>
          <div class="hero-knoppen">
            <a href="${escapeHtml(h.knopPrimair.link)}" class="knop knop--primair">${escapeHtml(h.knopPrimair.tekst)}</a>
            <a href="${escapeHtml(h.knopSecundair.link)}" class="knop knop--secundair">${escapeHtml(h.knopSecundair.tekst)}</a>
          </div>
        </div>
        <div class="hero-beeld">
          <img src="${escapeHtml(h.afbeelding)}" alt="${escapeHtml(h.afbeeldingAlt)}" loading="eager">
          ${h.uitgelichtCijfer ? `
          <div class="hero-cijfer">
            <strong>${escapeHtml(h.uitgelichtCijfer.cijfer)}</strong>
            <span>${escapeHtml(h.uitgelichtCijfer.label)}</span>
          </div>` : ""}
        </div>
      </div>
    </section>`;
}

// --------------------------------------------------------------- Diensten
function renderDiensten(config) {
  const d = config.diensten;
  const items = d.lijst
    .map(
      (item) => `
      <li class="dienst-item">
        <h3>${escapeHtml(item.naam)}</h3>
        <p>${escapeHtml(item.beschrijving)}</p>
        <span class="dienst-prijs">${escapeHtml(item.vanafPrijs)}</span>
      </li>`
    )
    .join("");

  return `
    <section class="sectie" id="diensten">
      <div class="container">
        <div class="sectie-kop">
          <h2>${escapeHtml(d.titel)}</h2>
          <p>${escapeHtml(d.intro)}</p>
        </div>
        <ul class="diensten-lijst">${items}</ul>
      </div>
    </section>`;
}

// --------------------------------------------------------------- Over ons
function renderOverOns(config) {
  const o = config.overOns;
  const paragrafen = o.tekst.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const stats = (o.statistieken || [])
    .map((s) => `<div><strong>${escapeHtml(s.cijfer)}</strong><span>${escapeHtml(s.label)}</span></div>`)
    .join("");

  return `
    <section class="sectie over-ons sectie--wissel" id="over-ons">
      <div class="container">
        <div class="over-ons-beeld">
          <img src="${escapeHtml(o.afbeelding)}" alt="${escapeHtml(o.afbeeldingAlt)}" loading="lazy">
        </div>
        <div class="over-ons-tekst">
          <h2>${escapeHtml(o.titel)}</h2>
          ${paragrafen}
          ${stats ? `<div class="over-ons-stats">${stats}</div>` : ""}
        </div>
      </div>
    </section>`;
}

// ------------------------------------------------------------- Waarom wij
function renderWaaromWij(config) {
  const w = config.waaromWij;
  const punten = w.punten
    .map(
      (p) => `
      <div class="waarom-item">
        <h3>${escapeHtml(p.naam)}</h3>
        <p>${escapeHtml(p.beschrijving)}</p>
      </div>`
    )
    .join("");

  return `
    <section class="sectie" id="waarom-wij">
      <div class="container">
        <div class="sectie-kop"><h2>${escapeHtml(w.titel)}</h2></div>
        <div class="waarom-grid">${punten}</div>
      </div>
    </section>`;
}

// -------------------------------------------------------------- Portfolio
function renderPortfolio(config) {
  const p = config.portfolio;
  const items = p.projecten
    .map(
      (proj) => `
      <div class="portfolio-item">
        <img src="${escapeHtml(proj.afbeelding)}" alt="${escapeHtml(proj.titel)}" loading="lazy">
        <div class="portfolio-label">
          <span>${escapeHtml(proj.categorie)}</span>
          <strong>${escapeHtml(proj.titel)}</strong>
        </div>
      </div>`
    )
    .join("");

  return `
    <section class="sectie" id="portfolio">
      <div class="container">
        <div class="sectie-kop">
          <h2>${escapeHtml(p.titel)}</h2>
          <p>${escapeHtml(p.intro)}</p>
        </div>
        <div class="portfolio-grid">${items}</div>
      </div>
    </section>`;
}

// ---------------------------------------------------------------- Reviews
function renderReviews(config) {
  const r = config.reviews;
  const kaarten = r.lijst
    .map(
      (review) => `
      <div class="review-kaart">
        <span class="sterren">${sterrenHtml(review.score)}</span>
        <p class="tekst">"${escapeHtml(review.tekst)}"</p>
        <div class="review-auteur">
          <div class="review-avatar">${escapeHtml(initialen(review.naam))}</div>
          <div>
            <strong>${escapeHtml(review.naam)}</strong>
            <span>${escapeHtml(review.plaats)}</span>
          </div>
        </div>
      </div>`
    )
    .join("");

  return `
    <section class="sectie sectie--wissel" id="reviews">
      <div class="container">
        <div class="reviews-kop-rij">
          <div class="sectie-kop" style="margin-bottom:0;">
            <h2>${escapeHtml(r.titel)}</h2>
          </div>
          <div class="reviews-score">
            <strong>${escapeHtml(r.gemiddeldeScore)}</strong>
            <span class="sterren">${sterrenHtml(r.gemiddeldeScore)}</span>
            <span>${escapeHtml(r.aantalReviews)} beoordelingen</span>
          </div>
        </div>
        <div class="reviews-rij">${kaarten}</div>
      </div>
    </section>`;
}

// -------------------------------------------------------------------- FAQ
function renderFaq(config) {
  const f = config.faq;
  const items = f.lijst
    .map(
      (item, i) => `
      <div class="faq-item" data-faq-item>
        <button class="faq-vraag" aria-expanded="false" aria-controls="faq-antwoord-${i}" id="faq-vraag-${i}">
          <span>${escapeHtml(item.vraag)}</span>
          <span class="faq-icoon" aria-hidden="true"></span>
        </button>
        <div class="faq-antwoord" id="faq-antwoord-${i}" role="region" aria-labelledby="faq-vraag-${i}">
          <p>${escapeHtml(item.antwoord)}</p>
        </div>
      </div>`
    )
    .join("");

  return `
    <section class="sectie" id="faq">
      <div class="container">
        <div class="sectie-kop"><h2>${escapeHtml(f.titel)}</h2></div>
        <div class="faq-lijst">${items}</div>
      </div>
    </section>`;
}

// --------------------------------------------------------------- CTA-band
function renderCtaBand(config) {
  const c = config.ctaBand;
  return `
    <section class="cta-band">
      <div class="container">
        <div>
          <h2>${escapeHtml(c.titel)}</h2>
          <p>${escapeHtml(c.tekst)}</p>
        </div>
        <a href="${escapeHtml(c.knop.link)}" class="knop knop--primair">${escapeHtml(c.knop.tekst)}</a>
      </div>
    </section>`;
}

// ----------------------------------------------------------------- Contact
function renderContact(config) {
  const c = config.contact;
  const s = config.socialMedia || [];
  const f = c.formulier;

  const openingstijden = c.openingstijden
    .map((r) => `<div class="openingstijden-rij"><span>${escapeHtml(r.dag)}</span><span>${escapeHtml(r.tijd)}</span></div>`)
    .join("");

  const socialLinks = s
    .map((item) => `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(item.platform)}">${escapeHtml(item.platform.slice(0, 2))}</a>`)
    .join("");

  return `
    <section class="sectie contact" id="contact">
      <div class="container">
        <div class="contact-formulier">
          <div class="sectie-kop">
            <h2>${escapeHtml(c.titel)}</h2>
            <p>${escapeHtml(c.intro)}</p>
          </div>
          <form id="contact-formulier" novalidate>
            <div class="formulier-veld">
              <label for="veld-naam">${escapeHtml(f.naamLabel)}</label>
              <input type="text" id="veld-naam" name="naam" required>
              <span class="formulier-fout"></span>
            </div>
            <div class="formulier-veld">
              <label for="veld-email">${escapeHtml(f.emailLabel)}</label>
              <input type="email" id="veld-email" name="email" required>
              <span class="formulier-fout"></span>
            </div>
            <div class="formulier-veld">
              <label for="veld-telefoon">${escapeHtml(f.telefoonLabel)}</label>
              <input type="tel" id="veld-telefoon" name="telefoon">
              <span class="formulier-fout"></span>
            </div>
            <div class="formulier-veld">
              <label for="veld-bericht">${escapeHtml(f.berichtLabel)}</label>
              <textarea id="veld-bericht" name="bericht" placeholder="${escapeHtml(f.berichtPlaceholder)}" required></textarea>
              <span class="formulier-fout"></span>
            </div>
            <button type="submit" class="knop knop--primair">${escapeHtml(f.verzendKnopTekst)}</button>
            <div class="formulier-melding" id="formulier-melding" role="status"></div>
          </form>
        </div>
        <div class="contact-info">
          <div class="contact-info-blok">
            <div class="contact-info-rij"><div><strong>Telefoon</strong><a href="tel:${escapeHtml(c.telefoonnummer.replace(/\s/g, ""))}">${escapeHtml(c.telefoonnummer)}</a></div></div>
            <div class="contact-info-rij"><div><strong>E-mail</strong><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></div></div>
            <div class="contact-info-rij"><div><strong>Adres</strong><span>${escapeHtml(c.adres)}, ${escapeHtml(c.postcode)} ${escapeHtml(c.plaats)}</span></div></div>
            <div class="contact-info-rij" style="flex-direction:column; align-items:stretch;">
              <strong style="margin-bottom:0.5rem;">Openingstijden</strong>
              ${openingstijden}
            </div>
          </div>
          ${socialLinks ? `<div class="social-rij">${socialLinks}</div>` : ""}
        </div>
      </div>
    </section>`;
}

// ----------------------------------------------------------------- Locatie
function renderLocatie(config) {
  const l = config.locatie;
  return `
    <section class="sectie locatie sectie--wissel" id="locatie">
      <div class="container">
        <div class="sectie-kop">
          <h2>${escapeHtml(l.titel)}</h2>
          <p>${escapeHtml(l.tekst)}</p>
        </div>
        <iframe src="${escapeHtml(l.googleMapsEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Locatie op Google Maps"></iframe>
      </div>
    </section>`;
}

// ------------------------------------------------------------------ Footer
function renderFooter(config) {
  const { bedrijf, footer, navigatie } = config;
  const jaar = new Date().getFullYear();

  const kolomLinks = footer.kolomLinks.items
    .map((item) => `<li><a href="${escapeHtml(item.link)}">${escapeHtml(item.label)}</a></li>`)
    .join("");

  const juridisch = footer.juridischeLinks
    .map((item) => `<a href="${escapeHtml(item.link)}">${escapeHtml(item.label)}</a>`)
    .join("");

  const contact = config.contact;

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-top">
          <div>
            <div class="footer-logo">${escapeHtml(bedrijf.naam)}</div>
            <p>${escapeHtml(footer.tekst)}</p>
          </div>
          <div class="footer-kolom">
            <h3>${escapeHtml(footer.kolomLinks.titel)}</h3>
            <ul>${kolomLinks}</ul>
          </div>
          <div class="footer-kolom">
            <h3>Contact</h3>
            <ul>
              <li>${escapeHtml(contact.telefoonnummer)}</li>
              <li>${escapeHtml(contact.email)}</li>
              <li>${escapeHtml(contact.adres)}, ${escapeHtml(contact.plaats)}</li>
            </ul>
          </div>
        </div>
        <div class="footer-onder">
          <span>&copy; ${jaar} ${escapeHtml(bedrijf.naam)}. ${escapeHtml(footer.copyright)}</span>
          <div class="footer-onder-links">${juridisch}</div>
        </div>
      </div>
    </footer>`;
}

// Koppeling tussen sectie-id (zoals gebruikt in config.secties) en renderfunctie.
const SECTION_RENDERERS = {
  "diensten": renderDiensten,
  "over-ons": renderOverOns,
  "waarom-wij": renderWaaromWij,
  "portfolio": renderPortfolio,
  "reviews": renderReviews,
  "faq": renderFaq,
  "cta-band": renderCtaBand,
  "contact": renderContact,
  "locatie": renderLocatie,
};
