/**
 * ============================================================================
 *  SERVER/INDEX.JS
 * ============================================================================
 *  Kleine Express-server die:
 *    1. De website serveert (map /public) — GEEN inlog nodig, publiek.
 *    2. Het admin-paneel serveert (map /admin) — WEL inlog nodig.
 *    3. Een config-API aanbiedt (GET is publiek — de website heeft dit nodig
 *       om te renderen — PUT vereist inlog).
 *    4. Een upload-API aanbiedt (vereist inlog).
 *    5. Login, eenmalige setup en gebruikersbeheer met rollen (admin/editor).
 *
 *  Gebruikers staan in data/users.json (wachtwoorden gehasht met bcrypt).
 *  Sessies zijn stateless, ondertekende cookies (cookie-session) — er is dus
 *  geen aparte sessie-database nodig. De ondertekeningssleutel wordt bij de
 *  eerste start gegenereerd en bewaard in data/session-secret.txt.
 * ============================================================================
 */
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.set("trust proxy", 1); // nodig als de site achter een reverse proxy draait (voor secure cookies)
const PORT = process.env.PORT || 80;

const DATA_DIR = path.join(__dirname, "..", "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "data-default", "config.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const USERS_PATH = path.join(DATA_DIR, "users.json");
const SESSION_SECRET_PATH = path.join(DATA_DIR, "session-secret.txt");
const ADMIN_DIR = path.join(__dirname, "..", "admin");

const ROLLEN = ["admin", "editor"];

// ------------------------------------------------------------- Basissetup
function zorgVoorBasisbestanden() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(DEFAULT_CONFIG_PATH, CONFIG_PATH);
    console.log("Geen data/config.json gevonden — standaardinhoud gekopieerd.");
  }
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, "[]", "utf-8");
}
zorgVoorBasisbestanden();

function laadSessionSecret() {
  if (fs.existsSync(SESSION_SECRET_PATH)) {
    return fs.readFileSync(SESSION_SECRET_PATH, "utf-8").trim();
  }
  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SESSION_SECRET_PATH, secret, "utf-8");
  return secret;
}

app.use(express.json({ limit: "5mb" }));
app.use(
  cookieSession({
    name: "sessie",
    keys: [laadSessionSecret()],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dagen
    httpOnly: true,
    sameSite: "lax",
  })
);

// ------------------------------------------------------------ Gebruikers
function laadGebruikers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
  } catch (err) {
    console.error("Kon users.json niet lezen:", err);
    return [];
  }
}
function slaGebruikersOp(lijst) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(lijst, null, 2), "utf-8");
}
function heeftGebruikers() {
  return laadGebruikers().length > 0;
}
function vindGebruikerByNaam(naam) {
  return laadGebruikers().find((g) => g.gebruikersnaam.toLowerCase() === String(naam).toLowerCase());
}
function vindGebruikerById(id) {
  return laadGebruikers().find((g) => g.id === id);
}
function gebruikerZonderHash(g) {
  return { id: g.id, gebruikersnaam: g.gebruikersnaam, rol: g.rol, aangemaaktOp: g.aangemaaktOp };
}
function isIngelogd(req) {
  return !!(req.session && req.session.userId && vindGebruikerById(req.session.userId));
}

function vereistLogin(req, res, next) {
  if (!isIngelogd(req)) return res.status(401).json({ error: "Niet ingelogd." });
  next();
}
function vereistRol(...toegestaneRollen) {
  return (req, res, next) => {
    if (!isIngelogd(req)) return res.status(401).json({ error: "Niet ingelogd." });
    const gebruiker = vindGebruikerById(req.session.userId);
    if (!toegestaneRollen.includes(gebruiker.rol)) {
      return res.status(403).json({ error: "Geen toegang met jouw rol." });
    }
    next();
  };
}

// ------------------------------------------------------------- Setup-API
// Alleen bruikbaar zolang er nog GEEN gebruikers bestaan — maakt de eerste
// (admin-)account aan en logt die meteen in.
app.post("/api/setup", async (req, res) => {
  if (heeftGebruikers()) {
    return res.status(403).json({ error: "Setup is al voltooid — er bestaat al een account." });
  }
  const { gebruikersnaam, wachtwoord } = req.body || {};
  if (!gebruikersnaam || !wachtwoord) {
    return res.status(400).json({ error: "Gebruikersnaam en wachtwoord zijn verplicht." });
  }
  if (String(wachtwoord).length < 8) {
    return res.status(400).json({ error: "Wachtwoord moet minimaal 8 tekens zijn." });
  }
  const hash = await bcrypt.hash(String(wachtwoord), 10);
  const nieuweGebruiker = {
    id: crypto.randomBytes(8).toString("hex"),
    gebruikersnaam: String(gebruikersnaam).trim(),
    wachtwoordHash: hash,
    rol: "admin",
    aangemaaktOp: new Date().toISOString(),
  };
  slaGebruikersOp([nieuweGebruiker]);
  req.session.userId = nieuweGebruiker.id;
  res.json({ ok: true, gebruiker: gebruikerZonderHash(nieuweGebruiker) });
});

// -------------------------------------------------------------- Login-API
app.post("/api/login", async (req, res) => {
  const { gebruikersnaam, wachtwoord } = req.body || {};
  if (!gebruikersnaam || !wachtwoord) {
    return res.status(400).json({ error: "Vul gebruikersnaam en wachtwoord in." });
  }
  const gebruiker = vindGebruikerByNaam(gebruikersnaam);
  if (!gebruiker) {
    return res.status(401).json({ error: "Onjuiste gebruikersnaam of wachtwoord." });
  }
  const klopt = await bcrypt.compare(String(wachtwoord), gebruiker.wachtwoordHash);
  if (!klopt) {
    return res.status(401).json({ error: "Onjuiste gebruikersnaam of wachtwoord." });
  }
  req.session.userId = gebruiker.id;
  res.json({ ok: true, gebruiker: gebruikerZonderHash(gebruiker) });
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  if (!heeftGebruikers()) return res.json({ ingelogd: false, setupNodig: true });
  if (!isIngelogd(req)) return res.json({ ingelogd: false, setupNodig: false });
  const gebruiker = vindGebruikerById(req.session.userId);
  res.json({ ingelogd: true, gebruiker: gebruikerZonderHash(gebruiker) });
});

// ------------------------------------------------------ Gebruikersbeheer-API
// Alleen voor de rol "admin".
app.get("/api/gebruikers", vereistRol("admin"), (req, res) => {
  res.json(laadGebruikers().map(gebruikerZonderHash));
});

app.post("/api/gebruikers", vereistRol("admin"), async (req, res) => {
  const { gebruikersnaam, wachtwoord, rol } = req.body || {};
  if (!gebruikersnaam || !wachtwoord || !rol) {
    return res.status(400).json({ error: "Gebruikersnaam, wachtwoord en rol zijn verplicht." });
  }
  if (!ROLLEN.includes(rol)) {
    return res.status(400).json({ error: `Ongeldige rol. Kies uit: ${ROLLEN.join(", ")}.` });
  }
  if (String(wachtwoord).length < 8) {
    return res.status(400).json({ error: "Wachtwoord moet minimaal 8 tekens zijn." });
  }
  if (vindGebruikerByNaam(gebruikersnaam)) {
    return res.status(409).json({ error: "Deze gebruikersnaam bestaat al." });
  }
  const hash = await bcrypt.hash(String(wachtwoord), 10);
  const gebruikers = laadGebruikers();
  const nieuweGebruiker = {
    id: crypto.randomBytes(8).toString("hex"),
    gebruikersnaam: String(gebruikersnaam).trim(),
    wachtwoordHash: hash,
    rol,
    aangemaaktOp: new Date().toISOString(),
  };
  gebruikers.push(nieuweGebruiker);
  slaGebruikersOp(gebruikers);
  res.json({ ok: true, gebruiker: gebruikerZonderHash(nieuweGebruiker) });
});

app.delete("/api/gebruikers/:id", vereistRol("admin"), (req, res) => {
  const gebruikers = laadGebruikers();
  const doelwit = gebruikers.find((g) => g.id === req.params.id);
  if (!doelwit) return res.status(404).json({ error: "Gebruiker niet gevonden." });

  if (doelwit.id === req.session.userId) {
    return res.status(400).json({ error: "Je kunt je eigen account niet verwijderen terwijl je bent ingelogd." });
  }
  const aantalAdmins = gebruikers.filter((g) => g.rol === "admin").length;
  if (doelwit.rol === "admin" && aantalAdmins <= 1) {
    return res.status(400).json({ error: "Je kunt de laatste beheerder niet verwijderen." });
  }
  slaGebruikersOp(gebruikers.filter((g) => g.id !== req.params.id));
  res.json({ ok: true });
});

// ------------------------------------------------------------- Uploads-API
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const TOEGESTANE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const EXTENSIE_PER_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const extensie = EXTENSIE_PER_TYPE[file.mimetype] || path.extname(file.originalname) || "";
      cb(null, crypto.randomBytes(8).toString("hex") + extensie);
    },
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (!TOEGESTANE_TYPES.has(file.mimetype)) {
      return cb(new Error("Alleen JPG, PNG, WEBP, GIF of SVG-afbeeldingen zijn toegestaan."));
    }
    cb(null, true);
  },
});

app.post("/api/upload", vereistLogin, (req, res) => {
  upload.single("bestand")(req, res, (err) => {
    if (err) {
      const boodschap =
        err.code === "LIMIT_FILE_SIZE" ? "Bestand is te groot (max. 8 MB)." : err.message || "Uploaden is mislukt.";
      return res.status(400).json({ error: boodschap });
    }
    if (!req.file) return res.status(400).json({ error: "Geen bestand ontvangen." });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

// -------------------------------------------------------------- Config-API
// GET is bewust PUBLIEK: de website zelf (voor elke bezoeker) haalt hier de
// inhoud op om te kunnen renderen. Alleen PUT (opslaan) vereist inlog.
app.get("/api/config", (req, res) => {
  try {
    const ruw = fs.readFileSync(CONFIG_PATH, "utf-8");
    res.type("application/json").send(ruw);
  } catch (err) {
    console.error("Kon config.json niet lezen:", err);
    res.status(500).json({ error: "Kon de configuratie niet lezen." });
  }
});

app.put("/api/config", vereistLogin, (req, res) => {
  const nieuweConfig = req.body;
  if (!nieuweConfig || typeof nieuweConfig !== "object" || Array.isArray(nieuweConfig)) {
    return res.status(400).json({ error: "Ongeldige configuratie ontvangen." });
  }
  try {
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

// ---------------------------------------------------- Admin-paneel (beveiligd)
// Deze route onderschept GET /admin en /admin/index.html VOORDAT de
// static-middleware daaronder de bestanden serveert:
//   - geen gebruikers?      → naar de eenmalige setup-pagina
//   - niet ingelogd?        → naar de inlogpagina
//   - anders                → next() laat de static-middleware index.html serveren
app.get(["/admin", "/admin/index.html"], (req, res, next) => {
  if (!heeftGebruikers()) return res.redirect("/admin/setup.html");
  if (!isIngelogd(req)) return res.redirect("/admin/login.html");
  next();
});

// --------------------------------------------------------------- Statisch
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/admin", express.static(ADMIN_DIR));
app.use("/", express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Website + admin-paneel draaien op poort ${PORT}`);
  console.log(`Admin-paneel: http://localhost:${PORT}/admin`);
});
