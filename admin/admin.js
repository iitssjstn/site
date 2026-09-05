/**
 * ============================================================================
 *  ADMIN.JS
 * ============================================================================
 *  Genereert het hele beheerformulier uit één schema (SCHEMA, onderin dit
 *  bestand) en de actuele inhoud (opgehaald bij GET /api/config). Bij
 *  "Opslaan" wordt de volledige, bijgewerkte inhoud teruggestuurd naar
 *  PUT /api/config.
 *
 *  Nieuw veld nodig? Voeg een regel toe aan het schema — er hoeft verder
 *  niets aan de rest van dit bestand te veranderen.
 * ============================================================================
 */

let CONFIG = null; // wordt gevuld na het laden; dit is de "working copy"
let HUIDIGE_GEBRUIKER = null;

// ---------------------------------------------------------------- Pad-helpers
function getIn(obj, pad) {
  if (pad === "" || pad == null) return obj;
  return pad.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setIn(obj, pad, waarde) {
  const delen = pad.split(".");
  let o = obj;
  for (let i = 0; i < delen.length - 1; i++) {
    o = o[delen[i]];
  }
  o[delen[delen.length - 1]] = waarde;
}

// ------------------------------------------------------------- DOM-helpers
function el(tag, attrs, ...kinderen) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  });
  kinderen.flat().forEach((kind) => {
    if (kind == null) return;
    node.appendChild(typeof kind === "string" ? document.createTextNode(kind) : kind);
  });
  return node;
}

// --------------------------------------------------------- Eén invoerveld
function renderVeld(config, veld) {
  const waarde = getIn(config, veld.path);

  // Kleurvelden krijgen een eigen label mét kleurstaal ervoor, zodat meteen
  // duidelijk is welke kleur bij welke naam hoort — zonder dat je hoeft te
  // schakelen tussen het label en de invoer eronder.
  if (veld.type === "color") {
    const geldig = /^#[0-9a-fA-F]{6}$/.test(waarde);
    const swatch = el("span", { class: "admin-kleur-swatch" });
    swatch.style.backgroundColor = geldig ? waarde : "#000000";

    const wrapper = el("div", { class: "admin-veld" }, el("label", { class: "admin-kleur-label" }, swatch, veld.label));

    const rij = el("div", { class: "admin-kleur-rij" });
    const kleurInput = el("input", { type: "color" });
    kleurInput.value = geldig ? waarde : "#000000";
    const tekstInput = el("input", { type: "text" });
    tekstInput.value = waarde ?? "";

    kleurInput.addEventListener("input", (e) => {
      tekstInput.value = e.target.value;
      setIn(config, veld.path, e.target.value);
      swatch.style.backgroundColor = e.target.value;
    });
    tekstInput.addEventListener("input", (e) => {
      setIn(config, veld.path, e.target.value);
      if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
        kleurInput.value = e.target.value;
        swatch.style.backgroundColor = e.target.value;
      }
    });

    rij.appendChild(kleurInput);
    rij.appendChild(tekstInput);
    wrapper.appendChild(rij);
    return wrapper;
  }

  const wrapper = el("div", { class: "admin-veld" }, el("label", {}, veld.label));

  if (veld.type === "textarea") {
    const input = el("textarea", {
      oninput: (e) => setIn(config, veld.path, e.target.value),
    });
    input.value = waarde ?? "";
    wrapper.appendChild(input);
  } else if (veld.type === "select") {
    const select = el(
      "select",
      { onchange: (e) => setIn(config, veld.path, e.target.value) },
      ...veld.options.map((opt) => {
        const optionEl = el("option", { value: opt.waarde }, opt.label);
        if (opt.waarde === waarde) optionEl.setAttribute("selected", "selected");
        return optionEl;
      })
    );
    wrapper.appendChild(select);
  } else if (veld.type === "image") {
    wrapper.appendChild(renderAfbeeldingVeld(config, veld, waarde));
    return wrapper;
  } else if (veld.type === "number") {
    const input = el("input", {
      type: "number",
      step: veld.step || "any",
      oninput: (e) => setIn(config, veld.path, e.target.value === "" ? "" : Number(e.target.value)),
    });
    input.value = waarde ?? "";
    wrapper.appendChild(input);
  } else {
    const input = el("input", {
      type: "text",
      oninput: (e) => setIn(config, veld.path, e.target.value),
    });
    input.value = waarde ?? "";
    wrapper.appendChild(input);
  }
  return wrapper;
}

function renderVeldenGrid(config, velden) {
  return el("div", { class: "admin-grid-2" }, ...velden.map((v) => renderVeld(config, v)));
}

// ---------------------------------------------------------- Afbeeldingsveld
// Toont een URL-veld + preview + een knop om een bestand te uploaden. Na
// een geslaagde upload wordt de URL automatisch ingevuld.
function renderAfbeeldingVeld(config, veld, huidigeWaarde) {
  const wrapper = el("div", { class: "admin-afbeelding-veld" });

  const preview = el("img", { class: "admin-afbeelding-preview" });
  preview.src = huidigeWaarde || "";
  preview.style.display = huidigeWaarde ? "block" : "none";
  preview.addEventListener("error", () => { preview.style.display = "none"; });
  preview.addEventListener("load", () => { preview.style.display = "block"; });

  const urlInput = el("input", { type: "text", placeholder: "https://... of upload hieronder" });
  urlInput.value = huidigeWaarde || "";
  urlInput.addEventListener("input", (e) => {
    setIn(config, veld.path, e.target.value);
    preview.src = e.target.value;
  });

  const bestandInput = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp,image/gif,image/svg+xml" });
  bestandInput.style.display = "none";

  const statusEl = el("span", { class: "admin-afbeelding-status" }, "");

  const uploadKnop = el(
    "button",
    { type: "button", class: "admin-knop admin-knop--rand admin-knop--klein", onclick: () => bestandInput.click() },
    "Bestand kiezen..."
  );

  bestandInput.addEventListener("change", async () => {
    const bestand = bestandInput.files[0];
    if (!bestand) return;
    statusEl.textContent = "Bezig met uploaden...";
    uploadKnop.disabled = true;
    try {
      const formData = new FormData();
      formData.append("bestand", bestand);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Uploaden is mislukt.");
      urlInput.value = data.url;
      setIn(config, veld.path, data.url);
      preview.src = data.url;
      statusEl.textContent = "Geüpload ✓";
      setTimeout(() => { statusEl.textContent = ""; }, 3000);
    } catch (err) {
      statusEl.textContent = err.message || "Uploaden is mislukt.";
    } finally {
      uploadKnop.disabled = false;
      bestandInput.value = "";
    }
  });

  wrapper.appendChild(preview);
  wrapper.appendChild(urlInput);
  wrapper.appendChild(el("div", { class: "admin-afbeelding-acties" }, uploadKnop, bestandInput, statusEl));
  return wrapper;
}

// ------------------------------------------------------------- Lijst-editor
// Ondersteunt zowel lijsten van objecten (itemSchema met meerdere velden)
// als lijsten van platte waarden (itemSchema met precies één veld met path: "").
function renderLijst(config, lijstDef) {
  const container = el("div", { class: "admin-lijst" });
  const itemsContainer = el("div", {});
  container.appendChild(itemsContainer);

  const heeftArchief = !!lijstDef.archiefPath;
  if (heeftArchief && !getIn(config, lijstDef.archiefPath)) {
    setIn(config, lijstDef.archiefPath, []);
  }

  function tekenItems() {
    itemsContainer.innerHTML = "";
    const arr = getIn(config, lijstDef.path) || [];
    arr.forEach((item, index) => {
      const kaart = el("div", { class: "admin-lijst-item" });
      const kop = el(
        "div",
        { class: "admin-lijst-item-kop" },
        el("span", { class: "admin-lijst-item-titel" }, `${lijstDef.itemLabel} ${index + 1}`),
        el(
          "div",
          { class: "admin-lijst-item-acties" },
          el("button", { type: "button", title: "Omhoog", onclick: () => verplaats(index, -1) }, "↑"),
          el("button", { type: "button", title: "Omlaag", onclick: () => verplaats(index, 1) }, "↓"),
          el(
            "button",
            {
              type: "button",
              class: "verwijderen",
              title: heeftArchief ? "Archiveren" : "Verwijderen",
              onclick: () => verwijder(index),
            },
            "✕"
          )
        )
      );
      kaart.appendChild(kop);

      const isEenvoudig = lijstDef.itemSchema.length === 1 && lijstDef.itemSchema[0].path === "";

      if (isEenvoudig) {
        const veldDef = lijstDef.itemSchema[0];
        const nepConfig = { waarde: item };
        const veld = renderVeld(nepConfig, { ...veldDef, path: "waarde", label: veldDef.label });
        const input = veld.querySelector("input, textarea, select");
        input.addEventListener("input", () => {
          arr[index] = getIn(nepConfig, "waarde");
        });
        input.addEventListener("change", () => {
          arr[index] = getIn(nepConfig, "waarde");
        });
        kaart.appendChild(veld);
      } else {
        lijstDef.itemSchema.forEach((veldDef) => {
          const veld = renderVeld(item, { ...veldDef });
          kaart.appendChild(veld);
        });
      }

      itemsContainer.appendChild(kaart);
    });
  }

  function verplaats(index, richting) {
    const arr = getIn(config, lijstDef.path);
    const nieuweIndex = index + richting;
    if (nieuweIndex < 0 || nieuweIndex >= arr.length) return;
    const tmp = arr[index];
    arr[index] = arr[nieuweIndex];
    arr[nieuweIndex] = tmp;
    tekenItems();
  }
  function verwijder(index) {
    const arr = getIn(config, lijstDef.path);
    if (heeftArchief) {
      const [item] = arr.splice(index, 1);
      getIn(config, lijstDef.archiefPath).push(item);
      tekenArchief();
    } else {
      arr.splice(index, 1);
    }
    tekenItems();
  }

  tekenItems();

  const toevoegKnop = el(
    "button",
    {
      type: "button",
      class: "admin-toevoegen",
      onclick: () => {
        const arr = getIn(config, lijstDef.path);
        const nieuwItem =
          typeof lijstDef.defaultItem === "function" ? lijstDef.defaultItem() : JSON.parse(JSON.stringify(lijstDef.defaultItem));
        arr.push(nieuwItem);
        tekenItems();
      },
    },
    lijstDef.addLabel
  );
  container.appendChild(toevoegKnop);

  // ------------------------------------------------------------- Archief
  // Verwijderde items belanden hier in plaats van definitief te verdwijnen,
  // zodat je ze later weer kunt terugzetten (bv. een review die je tijdelijk
  // niet wilt tonen, zonder de tekst kwijt te raken).
  let archiefEl = null;
  let archiefLijstEl = null;
  function tekenArchief() {
    if (!archiefLijstEl) return;
    const archiefArr = getIn(config, lijstDef.archiefPath) || [];
    archiefLijstEl.innerHTML = "";
    const label = archiefEl.querySelector(".admin-archief-kop span");
    if (label) label.textContent = `Gearchiveerd (${archiefArr.length})`;
    archiefArr.forEach((item, index) => {
      const previewTekst = lijstDef.archiefPreview ? lijstDef.archiefPreview(item) : JSON.stringify(item);
      const rij = el(
        "div",
        { class: "admin-archief-item" },
        el("span", { class: "admin-archief-item-tekst" }, previewTekst),
        el(
          "button",
          {
            type: "button",
            class: "admin-knop admin-knop--rand admin-knop--klein",
            onclick: () => {
              const [teruggezet] = archiefArr.splice(index, 1);
              getIn(config, lijstDef.path).push(teruggezet);
              tekenItems();
              tekenArchief();
            },
          },
          "↩ Terugzetten"
        )
      );
      archiefLijstEl.appendChild(rij);
    });
  }

  if (heeftArchief) {
    archiefLijstEl = el("div", { class: "admin-archief-lijst" });
    archiefEl = el(
      "div",
      { class: "admin-archief" },
      el(
        "button",
        { type: "button", class: "admin-archief-kop", onclick: () => archiefEl.classList.toggle("open") },
        el("span", {}, "Gearchiveerd (0)"),
        el("span", {}, "›")
      ),
      archiefLijstEl
    );
    container.appendChild(archiefEl);
    tekenArchief();
  }

  return container;
}

// ------------------------------------------------------------------ Secties
function renderSectie(config, sectieDef) {
  const sectieEl = el("section", { class: "admin-sectie" });
  const kop = el(
    "button",
    { type: "button", class: "admin-sectie-kop", onclick: () => sectieEl.classList.toggle("open") },
    el("span", {}, sectieDef.title),
    el("span", { class: "pijl" }, "›")
  );
  sectieEl.appendChild(kop);

  const body = el("div", { class: "admin-sectie-body" });
  if (sectieDef.uitleg) body.appendChild(el("p", { class: "admin-sectie-uitleg" }, sectieDef.uitleg));
  if (sectieDef.fields) body.appendChild(renderVeldenGrid(config, sectieDef.fields));
  if (sectieDef.list) body.appendChild(renderLijst(config, sectieDef.list));
  sectieEl.appendChild(body);

  return sectieEl;
}

// -------------------------------------------------------------------- Laden
async function laadConfig() {
  const res = await fetch("/api/config", { cache: "no-store" });
  if (!res.ok) throw new Error("Kon configuratie niet laden.");
  return res.json();
}

async function slaConfigOp(config) {
  const res = await fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Opslaan is mislukt.");
  return res.json();
}

function toonMelding(tekst, type) {
  const meldingEl = document.getElementById("melding");
  meldingEl.textContent = tekst;
  meldingEl.className = "admin-melding zichtbaar " + type;
  window.scrollTo({ top: 0, behavior: "smooth" });
  clearTimeout(toonMelding._timer);
  toonMelding._timer = setTimeout(() => meldingEl.classList.remove("zichtbaar"), 4000);
}

async function init() {
  const inhoud = document.getElementById("admin-inhoud");

  // Auth-check — de server blokkeert /admin al voor niet-ingelogde
  // bezoekers, maar deze check dekt ook het geval dat iemand lang op een
  // gecachete pagina blijft staan nadat de sessie is verlopen.
  try {
    const meRes = await fetch("/api/me");
    const me = await meRes.json();
    if (!me.ingelogd) {
      window.location.href = me.setupNodig ? "/admin/setup.html" : "/admin/login.html";
      return;
    }
    HUIDIGE_GEBRUIKER = me.gebruiker;
    const ingelogdAls = document.getElementById("ingelogd-als");
    if (ingelogdAls) {
      ingelogdAls.textContent = `${HUIDIGE_GEBRUIKER.gebruikersnaam} (${HUIDIGE_GEBRUIKER.rol})`;
    }
  } catch (err) {
    console.error(err);
  }

  try {
    CONFIG = await laadConfig();
  } catch (err) {
    inhoud.innerHTML = "";
    inhoud.appendChild(el("p", { class: "admin-laden" }, "Kon de inhoud niet laden. Ververs de pagina om het opnieuw te proberen."));
    console.error(err);
    return;
  }

  inhoud.innerHTML = "";
  SCHEMA.forEach((sectieDef) => inhoud.appendChild(renderSectie(CONFIG, sectieDef)));

  if (HUIDIGE_GEBRUIKER && HUIDIGE_GEBRUIKER.rol === "admin") {
    inhoud.appendChild(await renderGebruikersSectie());
  }

  const eerste = inhoud.querySelector(".admin-sectie");
  if (eerste) eerste.classList.add("open");

  const opslaanOnderaan = el(
    "div",
    { class: "admin-opslaan-onderaan" },
    el("button", { type: "button", class: "admin-knop admin-knop--primair", onclick: opslaan }, "Alles opslaan")
  );
  inhoud.appendChild(opslaanOnderaan);
}

// ------------------------------------------------------------ Gebruikersbeheer
// Werkt los van de "Opslaan"-knop van de content: elke actie (toevoegen,
// verwijderen) wordt meteen naar de server gestuurd, net als bij een echt
// gebruikersbeheerscherm.
async function renderGebruikersSectie() {
  const sectieEl = el("section", { class: "admin-sectie" });
  sectieEl.appendChild(
    el(
      "button",
      { type: "button", class: "admin-sectie-kop", onclick: () => sectieEl.classList.toggle("open") },
      el("span", {}, "Gebruikersbeheer"),
      el("span", { class: "pijl" }, "›")
    )
  );

  const body = el("div", { class: "admin-sectie-body" });
  body.appendChild(
    el(
      "p",
      { class: "admin-sectie-uitleg" },
      "Alleen zichtbaar voor accounts met de rol 'admin'. Wijzigingen hier zijn direct actief — hier is geen aparte opslaan-knop voor nodig."
    )
  );
  const lijstEl = el("div", {});
  const foutEl = el("div", { class: "admin-melding fout", style: "margin:0 0 1rem;" });
  body.appendChild(foutEl);
  body.appendChild(lijstEl);

  async function tekenGebruikers() {
    lijstEl.innerHTML = "";
    let gebruikers;
    try {
      const res = await fetch("/api/gebruikers");
      gebruikers = await res.json();
    } catch (err) {
      lijstEl.appendChild(el("p", {}, "Kon gebruikers niet laden."));
      return;
    }
    gebruikers.forEach((g) => {
      const rij = el(
        "div",
        { class: "admin-gebruiker-rij" },
        el(
          "div",
          { class: "admin-gebruiker-info" },
          el(
            "strong",
            {},
            g.gebruikersnaam,
            el("span", { class: `admin-rol-badge ${g.rol}` }, g.rol)
          ),
          el("span", {}, `Aangemaakt op ${new Date(g.aangemaaktOp).toLocaleDateString("nl-NL")}`)
        ),
        el(
          "button",
          {
            type: "button",
            class: "admin-knop admin-knop--verwijder admin-knop--klein",
            onclick: () => verwijderGebruiker(g),
          },
          "Verwijderen"
        )
      );
      lijstEl.appendChild(rij);
    });
  }

  async function verwijderGebruiker(g) {
    foutEl.classList.remove("zichtbaar");
    if (!window.confirm(`Account "${g.gebruikersnaam}" verwijderen?`)) return;
    try {
      const res = await fetch(`/api/gebruikers/${g.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verwijderen is mislukt.");
      tekenGebruikers();
    } catch (err) {
      foutEl.textContent = err.message;
      foutEl.classList.add("zichtbaar");
    }
  }

  await tekenGebruikers();

  // -------------------------------------------------------- Nieuw account
  const naamInput = el("input", { type: "text", placeholder: "Gebruikersnaam" });
  const wachtwoordInput = el("input", { type: "password", placeholder: "Wachtwoord (min. 8 tekens)" });
  const rolSelect = el(
    "select",
    {},
    el("option", { value: "editor" }, "Editor — kan inhoud bewerken"),
    el("option", { value: "admin" }, "Admin — kan ook accounts beheren")
  );
  const toevoegKnop = el(
    "button",
    {
      type: "button",
      class: "admin-knop admin-knop--primair admin-knop--klein",
      onclick: async () => {
        foutEl.classList.remove("zichtbaar");
        try {
          const res = await fetch("/api/gebruikers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gebruikersnaam: naamInput.value.trim(),
              wachtwoord: wachtwoordInput.value,
              rol: rolSelect.value,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Aanmaken is mislukt.");
          naamInput.value = "";
          wachtwoordInput.value = "";
          tekenGebruikers();
        } catch (err) {
          foutEl.textContent = err.message;
          foutEl.classList.add("zichtbaar");
        }
      },
    },
    "+ Account toevoegen"
  );

  body.appendChild(
    el(
      "div",
      { class: "admin-nieuw-gebruiker" },
      el("div", { class: "admin-veld" }, el("label", {}, "Gebruikersnaam"), naamInput),
      el("div", { class: "admin-veld" }, el("label", {}, "Wachtwoord"), wachtwoordInput),
      el("div", { class: "admin-veld" }, el("label", {}, "Rol"), rolSelect),
      toevoegKnop
    )
  );

  sectieEl.appendChild(body);
  return sectieEl;
}

async function opslaan() {
  try {
    await slaConfigOp(CONFIG);
    toonMelding("Opgeslagen — de website is bijgewerkt.", "succes");
  } catch (err) {
    console.error(err);
    toonMelding("Opslaan is mislukt. Probeer het opnieuw.", "fout");
  }
}

async function uitloggen() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
    window.location.href = "/admin/login.html";
  }
}

document.getElementById("opslaan-knop").addEventListener("click", opslaan);
document.getElementById("uitloggen-knop").addEventListener("click", uitloggen);
document.addEventListener("DOMContentLoaded", init);

// ============================================================================
//  SCHEMA — koppelt formuliervelden aan paden in de configuratie.
// ============================================================================
const SECTIE_OPTIES = [
  { waarde: "diensten", label: "Diensten" },
  { waarde: "over-ons", label: "Over ons" },
  { waarde: "waarom-wij", label: "Waarom voor ons kiezen" },
  { waarde: "portfolio", label: "Portfolio / galerij" },
  { waarde: "reviews", label: "Klantbeoordelingen" },
  { waarde: "faq", label: "Veelgestelde vragen" },
  { waarde: "cta-band", label: "Call-to-action band" },
  { waarde: "contact", label: "Contact" },
  { waarde: "locatie", label: "Locatie" },
];

const SCHEMA = [
  {
    title: "Bedrijfsgegevens",
    fields: [
      { path: "bedrijf.naam", label: "Bedrijfsnaam", type: "text" },
      { path: "bedrijf.slogan", label: "Slogan", type: "text" },
      { path: "bedrijf.logoTekst", label: "Logo-tekst (zonder logo-afbeelding)", type: "text" },
      { path: "bedrijf.logoAfbeelding", label: "Logo-afbeelding (optioneel)", type: "image" },
      { path: "bedrijf.favicon", label: "Pad naar favicon", type: "text" },
      { path: "bedrijf.kvkNummer", label: "KvK-nummer", type: "text" },
      { path: "bedrijf.btwNummer", label: "BTW-nummer", type: "text" },
    ],
  },
  {
    title: "Huisstijl — kleuren & lettertypes",
    fields: [
      { path: "stijl.kleuren.primair", label: "Primaire kleur", type: "color" },
      { path: "stijl.kleuren.primairDonker", label: "Primaire kleur (hover/donker)", type: "color" },
      { path: "stijl.kleuren.accent", label: "Accentkleur", type: "color" },
      { path: "stijl.kleuren.inkt", label: "Hoofdtekstkleur", type: "color" },
      { path: "stijl.kleuren.inktZacht", label: "Secundaire tekstkleur", type: "color" },
      { path: "stijl.kleuren.papier", label: "Achtergrondkleur", type: "color" },
      { path: "stijl.kleuren.papierDonker", label: "Achtergrond (wisselvlak)", type: "color" },
      { path: "stijl.kleuren.lijn", label: "Lijnkleur", type: "color" },
      { path: "stijl.lettertypes.uitgelicht", label: "Lettertype koppen (Google Fonts-naam)", type: "text" },
      { path: "stijl.lettertypes.basis", label: "Lettertype basistekst (Google Fonts-naam)", type: "text" },
    ],
  },
  {
    title: "Hero (bovenste sectie)",
    fields: [
      { path: "hero.titelRegels.0", label: "Titel — regel 1", type: "text" },
      { path: "hero.titelRegels.1", label: "Titel — regel 2", type: "text" },
      { path: "hero.tekst", label: "Ondersteunende tekst", type: "textarea" },
      { path: "hero.knopPrimair.tekst", label: "Primaire knop — tekst", type: "text" },
      { path: "hero.knopPrimair.link", label: "Primaire knop — link", type: "text" },
      { path: "hero.knopSecundair.tekst", label: "Secundaire knop — tekst", type: "text" },
      { path: "hero.knopSecundair.link", label: "Secundaire knop — link", type: "text" },
      { path: "hero.afbeelding", label: "Afbeelding", type: "image" },
      { path: "hero.afbeeldingAlt", label: "Afbeelding — alt-tekst", type: "text" },
      { path: "hero.uitgelichtCijfer.cijfer", label: "Uitgelicht cijfer", type: "text" },
      { path: "hero.uitgelichtCijfer.label", label: "Uitgelicht cijfer — label", type: "text" },
    ],
  },
  {
    title: "Diensten",
    fields: [
      { path: "diensten.titel", label: "Sectietitel", type: "text" },
      { path: "diensten.intro", label: "Introtekst", type: "textarea" },
    ],
    list: {
      path: "diensten.lijst",
      itemLabel: "Dienst",
      addLabel: "+ Dienst toevoegen",
      defaultItem: { naam: "", beschrijving: "", vanafPrijs: "" },
      itemSchema: [
        { path: "naam", label: "Naam", type: "text" },
        { path: "beschrijving", label: "Beschrijving", type: "textarea" },
        { path: "vanafPrijs", label: "Vanaf-prijs", type: "text" },
      ],
    },
  },
  {
    title: "Over ons",
    fields: [
      { path: "overOns.titel", label: "Sectietitel", type: "text" },
      { path: "overOns.tekst.0", label: "Alinea 1", type: "textarea" },
      { path: "overOns.tekst.1", label: "Alinea 2", type: "textarea" },
      { path: "overOns.afbeelding", label: "Afbeelding", type: "image" },
      { path: "overOns.afbeeldingAlt", label: "Afbeelding — alt-tekst", type: "text" },
    ],
    list: {
      path: "overOns.statistieken",
      itemLabel: "Statistiek",
      addLabel: "+ Statistiek toevoegen",
      defaultItem: { cijfer: "", label: "" },
      itemSchema: [
        { path: "cijfer", label: "Cijfer", type: "text" },
        { path: "label", label: "Label", type: "text" },
      ],
    },
  },
  {
    title: "Waarom voor ons kiezen",
    fields: [{ path: "waaromWij.titel", label: "Sectietitel", type: "text" }],
    list: {
      path: "waaromWij.punten",
      itemLabel: "Punt",
      addLabel: "+ Punt toevoegen",
      defaultItem: { naam: "", beschrijving: "" },
      itemSchema: [
        { path: "naam", label: "Naam", type: "text" },
        { path: "beschrijving", label: "Beschrijving", type: "textarea" },
      ],
    },
  },
  {
    title: "Portfolio / galerij",
    fields: [
      { path: "portfolio.titel", label: "Sectietitel", type: "text" },
      { path: "portfolio.intro", label: "Introtekst", type: "textarea" },
    ],
    list: {
      path: "portfolio.projecten",
      itemLabel: "Project",
      addLabel: "+ Project toevoegen",
      defaultItem: { titel: "", categorie: "", afbeelding: "" },
      itemSchema: [
        { path: "titel", label: "Titel", type: "text" },
        { path: "categorie", label: "Categorie", type: "text" },
        { path: "afbeelding", label: "Afbeelding", type: "image" },
      ],
    },
  },
  {
    title: "Klantbeoordelingen",
    uitleg:
      "Een review verwijderen (✕) archiveert 'm — de tekst blijft bewaard en je kunt 'm via 'Gearchiveerd' hieronder altijd weer terugzetten.",
    fields: [
      { path: "reviews.titel", label: "Sectietitel", type: "text" },
      { path: "reviews.gemiddeldeScore", label: "Gemiddelde score (bv. 4.9)", type: "number", step: "0.1" },
      { path: "reviews.aantalReviews", label: "Aantal reviews", type: "number", step: "1" },
    ],
    list: {
      path: "reviews.lijst",
      archiefPath: "reviews.archief",
      archiefPreview: (item) => `${item.naam || "(naamloos)"} — "${(item.tekst || "").slice(0, 60)}${(item.tekst || "").length > 60 ? "…" : ""}"`,
      itemLabel: "Review",
      addLabel: "+ Review toevoegen",
      defaultItem: { naam: "", plaats: "", score: 5, tekst: "" },
      itemSchema: [
        { path: "naam", label: "Naam", type: "text" },
        { path: "plaats", label: "Plaats", type: "text" },
        { path: "score", label: "Score (1-5)", type: "number", step: "1" },
        { path: "tekst", label: "Tekst", type: "textarea" },
      ],
    },
  },
  {
    title: "Veelgestelde vragen",
    fields: [{ path: "faq.titel", label: "Sectietitel", type: "text" }],
    list: {
      path: "faq.lijst",
      itemLabel: "Vraag",
      addLabel: "+ Vraag toevoegen",
      defaultItem: { vraag: "", antwoord: "" },
      itemSchema: [
        { path: "vraag", label: "Vraag", type: "text" },
        { path: "antwoord", label: "Antwoord", type: "textarea" },
      ],
    },
  },
  {
    title: "Call-to-action band",
    fields: [
      { path: "ctaBand.titel", label: "Titel", type: "text" },
      { path: "ctaBand.tekst", label: "Tekst", type: "textarea" },
      { path: "ctaBand.knop.tekst", label: "Knoptekst", type: "text" },
      { path: "ctaBand.knop.link", label: "Knoplink", type: "text" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { path: "contact.titel", label: "Sectietitel", type: "text" },
      { path: "contact.intro", label: "Introtekst", type: "textarea" },
      { path: "contact.telefoonnummer", label: "Telefoonnummer", type: "text" },
      { path: "contact.email", label: "E-mailadres", type: "text" },
      { path: "contact.adres", label: "Adres (straat + huisnummer)", type: "text" },
      { path: "contact.postcode", label: "Postcode", type: "text" },
      { path: "contact.plaats", label: "Plaats", type: "text" },
    ],
    uitleg: "Openingstijden hieronder bewerken:",
    list: {
      path: "contact.openingstijden",
      itemLabel: "Regel",
      addLabel: "+ Openingstijd-regel toevoegen",
      defaultItem: { dag: "", tijd: "" },
      itemSchema: [
        { path: "dag", label: "Dag(en)", type: "text" },
        { path: "tijd", label: "Tijd", type: "text" },
      ],
    },
  },
  {
    title: "Contactformulier — teksten",
    fields: [
      { path: "contact.formulier.naamLabel", label: "Label: naam", type: "text" },
      { path: "contact.formulier.emailLabel", label: "Label: e-mail", type: "text" },
      { path: "contact.formulier.telefoonLabel", label: "Label: telefoon", type: "text" },
      { path: "contact.formulier.berichtLabel", label: "Label: bericht", type: "text" },
      { path: "contact.formulier.berichtPlaceholder", label: "Placeholder berichtveld", type: "text" },
      { path: "contact.formulier.verzendKnopTekst", label: "Verzendknop-tekst", type: "text" },
      { path: "contact.formulier.succesBericht", label: "Bericht bij succes", type: "textarea" },
      { path: "contact.formulier.foutBericht", label: "Bericht bij fout", type: "textarea" },
      { path: "contact.formulier.verplichtVeldBericht", label: "Foutmelding: verplicht veld", type: "text" },
      { path: "contact.formulier.ongeldigEmailBericht", label: "Foutmelding: ongeldig e-mailadres", type: "text" },
    ],
  },
  {
    title: "Locatie",
    fields: [
      { path: "locatie.titel", label: "Sectietitel", type: "text" },
      { path: "locatie.tekst", label: "Tekst", type: "textarea" },
      { path: "locatie.googleMapsEmbedUrl", label: "Google Maps embed-URL", type: "text" },
    ],
  },
  {
    title: "Social media",
    list: {
      path: "socialMedia",
      itemLabel: "Link",
      addLabel: "+ Social-mediakanaal toevoegen",
      defaultItem: { platform: "", url: "" },
      itemSchema: [
        { path: "platform", label: "Platform (bv. Instagram)", type: "text" },
        { path: "url", label: "URL", type: "text" },
      ],
    },
  },
  {
    title: "Navigatiemenu",
    fields: [
      { path: "navigatieKnop.tekst", label: "Knop rechtsboven — tekst", type: "text" },
      { path: "navigatieKnop.link", label: "Knop rechtsboven — link", type: "text" },
    ],
    list: {
      path: "navigatie",
      itemLabel: "Menu-item",
      addLabel: "+ Menu-item toevoegen",
      defaultItem: { label: "", link: "" },
      itemSchema: [
        { path: "label", label: "Tekst", type: "text" },
        { path: "link", label: "Link (bv. #diensten)", type: "text" },
      ],
    },
  },
  {
    title: "Footer",
    fields: [
      { path: "footer.tekst", label: "Korte omschrijving", type: "textarea" },
      { path: "footer.kolomLinks.titel", label: "Titel linkkolom", type: "text" },
      { path: "footer.copyright", label: "Copyright-tekst (na het jaartal)", type: "text" },
    ],
  },
  {
    title: "Footer — snelkoppelingen",
    list: {
      path: "footer.kolomLinks.items",
      itemLabel: "Link",
      addLabel: "+ Link toevoegen",
      defaultItem: { label: "", link: "" },
      itemSchema: [
        { path: "label", label: "Tekst", type: "text" },
        { path: "link", label: "Link", type: "text" },
      ],
    },
  },
  {
    title: "Footer — juridische links",
    list: {
      path: "footer.juridischeLinks",
      itemLabel: "Link",
      addLabel: "+ Link toevoegen",
      defaultItem: { label: "", link: "" },
      itemSchema: [
        { path: "label", label: "Tekst", type: "text" },
        { path: "link", label: "Link", type: "text" },
      ],
    },
  },
  {
    title: "Sectievolgorde",
    uitleg:
      "Bepaalt welke secties worden getoond en in welke volgorde (hero staat altijd bovenaan, footer altijd onderaan). Verwijder een regel om een sectie te verbergen, verplaats een regel om de volgorde te wijzigen.",
    list: {
      path: "secties",
      itemLabel: "Sectie",
      addLabel: "+ Sectie toevoegen",
      defaultItem: "diensten",
      itemSchema: [{ path: "", label: "Sectie", type: "select", options: SECTIE_OPTIES }],
    },
  },
  {
    title: "SEO",
    fields: [
      { path: "seo.titel", label: "Paginatitel (browsertab)", type: "text" },
      { path: "seo.beschrijving", label: "Meta-omschrijving", type: "textarea" },
    ],
  },
];
