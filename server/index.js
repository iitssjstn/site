/**
 * ============================================================================
 *  SERVER/INDEX.JS
 * ============================================================================
 *  Kleine Express-server met drie taken:
 *    1. De website serveren (map /public)
 *    2. Het admin-paneel serveren (map /admin, bereikbaar op /admin)
 *    3. Een API aanbieden waarmee het admin-paneel de inhoud leest/opslaat
 *       (GET/PUT /api/config), die wegschrijft naar /app/data/config.json
 *
 *  ⚠️  LET OP — GEEN AUTHENTICATIE
 *  Op uitdrukkelijk verzoek zit er geen inlog/wachtwoord op /admin of op de
 *  API. Dat betekent dat IEDEREEN die het adres kent (bv. jouwdomein.nl/admin)
 *  de inhoud van de website kan aanpassen. Zie README.md → "Admin-paneel"
 *  voor hoe je dit alsnog eenvoudig kunt afschermen (bv. met basic auth op
 *  je reverse proxy) zodra je dat wilt.
 * ============================================================================
 */
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

const DATA_DIR = path.join(__dirname, "..", "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "data-default", "config.json");

// Zorg dat er altijd een beschrijfbaar config.json bestaat. Bij de eerste
// start (of een lege volume) wordt de standaardinhoud gekopieerd.
function zorgVoorConfigBestand() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(DEFAULT_CONFIG_PATH, CONFIG_PATH);
    console.log("Geen data/config.json gevonden — standaardinhoud gekopieerd.");
  }
}
zorgVoorConfigBestand();

app.use(express.json({ limit: "5mb" }));

// -------------------------------------------------------------- Config-API
app.get("/api/config", (req, res) => {
  try {
    const ruw = fs.readFileSync(CONFIG_PATH, "utf-8");
    res.type("application/json").send(ruw);
  } catch (err) {
    console.error("Kon config.json niet lezen:", err);
    res.status(500).json({ error: "Kon de configuratie niet lezen." });
  }
});

app.put("/api/config", (req, res) => {
  const nieuweConfig = req.body;
  if (!nieuweConfig || typeof nieuweConfig !== "object" || Array.isArray(nieuweConfig)) {
    return res.status(400).json({ error: "Ongeldige configuratie ontvangen." });
  }
  try {
    // Bewaar eerst een back-up van de vorige versie, voor het geval iets misgaat.
    if (fs.existsSync(CONFIG_PATH)) {
      fs.copyFileSync(CONFIG_PATH, CONFIG_PATH + ".bak");
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(nieuweConfig, null, 2), "utf-8");
    res.json({ ok: true });
  } catch (err) {
    console.error("Kon config.json niet opslaan:", err);
    res.status(500).json({ error: "Kon de configuratie niet opslaan." });
  }
});

// --------------------------------------------------------------- Statisch
app.use("/admin", express.static(path.join(__dirname, "..", "admin")));
app.use("/", express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Website + admin-paneel draaien op poort ${PORT}`);
  console.log(`Admin-paneel: http://localhost:${PORT}/admin`);
});
