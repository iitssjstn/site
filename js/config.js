/**
 * ============================================================================
 *  SITE.CONFIG.JS  —  HET ENIGE BESTAND DAT JE MEESTAL HOEFT AAN TE PASSEN
 * ============================================================================
 *
 *  Alle teksten, kleuren, lettertypes, afbeeldingen en instellingen van de
 *  website staan hieronder in één object: SITE_CONFIG.
 *
 *  Wil je deze template gebruiken voor een andere klant (kapper, garage,
 *  restaurant, makelaar, etc.)? Pas dan alleen dit bestand aan. De rest van
 *  de website (HTML, CSS, JS) hoef je niet te wijzigen.
 *
 *  Volg de kop "SNEL EEN NIEUWE KLANT OPZETTEN" in README.md voor een
 *  stappenplan.
 * ============================================================================
 */

const SITE_CONFIG = {

  // --------------------------------------------------------------------
  // 1. BEDRIJFSGEGEVENS
  // --------------------------------------------------------------------
  bedrijf: {
    naam: "Jansen Schilderwerken",
    slogan: "Vakwerk voor binnen en buiten",
    logoTekst: "Jansen", // gebruikt als tekst-logo als er geen logo-afbeelding is
    logoAfbeelding: "", // pad naar logo-bestand, bv. "img/logo.svg" — leeg = tekst-logo
    favicon: "img/favicon.svg",
    kvkNummer: "12345678",
    btwNummer: "NL001234567B01",
  },

  // --------------------------------------------------------------------
  // 2. HUISSTIJL — KLEUREN & LETTERTYPES
  // --------------------------------------------------------------------
  stijl: {
    kleuren: {
      primair: "#1E3A5F",       // hoofdkleur: knoppen, links, accenten
      primairDonker: "#152A45", // hover-status van de hoofdkleur
      accent: "#C97B3D",        // secundaire accentkleur — spaarzaam gebruiken
      inkt: "#1C1B19",          // hoofdtekstkleur
      inktZacht: "#57544D",     // secundaire tekstkleur
      papier: "#F6F5F1",        // achtergrondkleur (licht)
      papierDonker: "#EFEDE6",  // afwisselende sectie-achtergrond
      lijn: "#DEDAD3",          // dunne lijnen / randen
    },
    lettertypes: {
      // Beide lettertypes worden via Google Fonts geladen in index.html.
      // Pas ze daar aan als je andere fonts wilt gebruiken.
      uitgelicht: "'Fraunces', Georgia, serif",       // koppen / hero
      basis: "'Work Sans', Arial, sans-serif",         // lopende tekst / interface
    },
    // Hoekafronding: 0 = strak/zakelijk, hoger = zachter. Klein houden past
    // bij het rustige, ambachtelijke ontwerp van deze template.
    afronding: "3px",
  },

  // --------------------------------------------------------------------
  // 3. HERO (bovenste sectie)
  // --------------------------------------------------------------------
  hero: {
    titelRegels: [
      "Uw huis verdient",
      "een vakkundige kwast."
    ],
    tekst: "Al meer dan 15 jaar het vertrouwde adres in de regio voor schilderwerk dat jaren meegaat — binnen, buiten en alles ertussenin.",
    knopPrimair: { tekst: "Vraag een offerte aan", link: "#contact" },
    knopSecundair: { tekst: "Bekijk ons werk", link: "#portfolio" },
    afbeelding: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1400&auto=format&fit=crop",
    afbeeldingAlt: "Schilder aan het werk op een ladder buiten een woning",
    uitgelichtCijfer: { cijfer: "15+", label: "jaar ervaring in de regio" },
  },

  // --------------------------------------------------------------------
  // 4. DIENSTEN
  // --------------------------------------------------------------------
  diensten: {
    titel: "Onze diensten",
    intro: "Van een enkele kamer tot de complete buitenkant van uw woning — wij leveren strak, duurzaam schilderwerk.",
    lijst: [
      {
        naam: "Binnenschilderwerk",
        beschrijving: "Wanden, plafonds, kozijnen en deuren strak in de verf, met minimale overlast in huis.",
        vanafPrijs: "€ 4,50 per m²",
      },
      {
        naam: "Buitenschilderwerk",
        beschrijving: "Gevels, kozijnen en dakranden beschermd tegen weer en wind met duurzame verfsystemen.",
        vanafPrijs: "€ 6,50 per m²",
      },
      {
        naam: "Houtrotreparatie",
        beschrijving: "Aantasting tijdig verholpen, zodat kozijnen en deuren weer jarenlang meegaan.",
        vanafPrijs: "Op basis van inspectie",
      },
      {
        naam: "Behangwerk",
        beschrijving: "Vakkundig aanbrengen van behang, van vlies tot fotobehang, strak en naadloos afgewerkt.",
        vanafPrijs: "€ 3,25 per m²",
      },
      {
        naam: "Kleuradvies",
        beschrijving: "Persoonlijk advies aan huis, zodat de kleur precies past bij uw interieur of gevel.",
        vanafPrijs: "Gratis bij een offerte",
      },
      {
        naam: "Onderhoudscontracten",
        beschrijving: "Periodiek onderhoud aan uw pand, zodat schade vroeg wordt gesignaleerd en verholpen.",
        vanafPrijs: "Op aanvraag",
      },
    ],
  },

  // --------------------------------------------------------------------
  // 5. OVER ONS
  // --------------------------------------------------------------------
  overOns: {
    titel: "Over ons",
    tekst: [
      "Jansen Schilderwerken is een familiebedrijf dat al drie generaties actief is in de regio. Wat begon als eenmanszaak van opa Jansen, is uitgegroeid tot een hecht team van vakmensen dat dagelijks klaarstaat voor particulieren en bedrijven.",
      "We werken met duurzame materialen, houden ons aan afspraken en leveren werk af waar we zelf trots op zijn. Geen onderaannemers, geen verrassingen achteraf — gewoon vakwerk van mensen die hun vak verstaan."
    ],
    afbeelding: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    afbeeldingAlt: "Team van Jansen Schilderwerken aan het werk",
    statistieken: [
      { cijfer: "450+", label: "afgeronde projecten" },
      { cijfer: "15", label: "jaar ervaring" },
      { cijfer: "4,9", label: "gemiddelde beoordeling" },
    ],
  },

  // --------------------------------------------------------------------
  // 6. WAAROM VOOR ONS KIEZEN
  // --------------------------------------------------------------------
  waaromWij: {
    titel: "Waarom kiezen voor Jansen",
    punten: [
      {
        naam: "Vaste contactpersoon",
        beschrijving: "U schakelt van begin tot eind met dezelfde vakman — geen wisselende gezichten.",
      },
      {
        naam: "Schriftelijke garantie",
        beschrijving: "Op al ons schilderwerk krijgt u minimaal 5 jaar garantie, zwart op wit.",
      },
      {
        naam: "Transparante prijsopgave",
        beschrijving: "Vooraf een duidelijke offerte, zonder verborgen kosten achteraf.",
      },
      {
        naam: "Werken met kwaliteitsverf",
        beschrijving: "Uitsluitend A-merken, geselecteerd op duurzaamheid per ondergrond.",
      },
    ],
  },

  // --------------------------------------------------------------------
  // 7. PORTFOLIO / GALERIJ
  // --------------------------------------------------------------------
  portfolio: {
    titel: "Ons werk",
    intro: "Een selectie van recent afgeronde projecten in de regio.",
    projecten: [
      { titel: "Jaren '30 woning, Apeldoorn", categorie: "Buitenschilderwerk", afbeelding: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=900&auto=format&fit=crop" },
      { titel: "Woonkamer renovatie", categorie: "Binnenschilderwerk", afbeelding: "https://images.unsplash.com/photo-1595514535215-8f2be3a3f16b?q=80&w=900&auto=format&fit=crop" },
      { titel: "Kantoorpand centrum", categorie: "Buitenschilderwerk", afbeelding: "https://images.unsplash.com/photo-1523419409543-8c1a04d86f8c?q=80&w=900&auto=format&fit=crop" },
      { titel: "Kozijnrenovatie", categorie: "Houtrotreparatie", afbeelding: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=900&auto=format&fit=crop" },
      { titel: "Slaapkamer met behang", categorie: "Behangwerk", afbeelding: "https://images.unsplash.com/photo-1595526051245-4506e0005bd0?q=80&w=900&auto=format&fit=crop" },
      { titel: "Vrijstaande woning", categorie: "Buitenschilderwerk", afbeelding: "https://images.unsplash.com/photo-1592595896616-c37162298647?q=80&w=900&auto=format&fit=crop" },
    ],
  },

  // --------------------------------------------------------------------
  // 8. KLANTBEOORDELINGEN
  // --------------------------------------------------------------------
  reviews: {
    titel: "Wat onze klanten zeggen",
    gemiddeldeScore: 4.9,
    aantalReviews: 128,
    lijst: [
      { naam: "Marieke de Vries", plaats: "Apeldoorn", score: 5, tekst: "Ontzettend tevreden over het schilderwerk aan onze gevel. Netjes, op tijd en precies zoals afgesproken." },
      { naam: "Hans Bakker", plaats: "Zutphen", score: 5, tekst: "Duidelijke offerte, geen verrassingen achteraf. Het resultaat overtreft onze verwachtingen." },
      { naam: "Fatima El Amrani", plaats: "Deventer", score: 5, tekst: "Al de derde keer dat we Jansen inschakelen. Altijd vakkundig en vriendelijk personeel." },
      { naam: "Peter Willemsen", plaats: "Apeldoorn", score: 4, tekst: "Prima werk geleverd, wel iets later gestart dan gepland, maar de kwaliteit maakte dat helemaal goed." },
    ],
  },

  // --------------------------------------------------------------------
  // 9. VEELGESTELDE VRAGEN
  // --------------------------------------------------------------------
  faq: {
    titel: "Veelgestelde vragen",
    lijst: [
      { vraag: "Hoe snel kan ik een offerte verwachten?", antwoord: "Binnen twee werkdagen na een vrijblijvend inspectiebezoek ontvangt u een gedetailleerde offerte." },
      { vraag: "Werken jullie ook in het weekend?", antwoord: "In overleg is dit mogelijk, bijvoorbeeld bij spoedklussen. Standaard werken wij van maandag tot en met vrijdag." },
      { vraag: "Welke garantie geven jullie op het schilderwerk?", antwoord: "Op al ons werk geven wij minimaal 5 jaar schriftelijke garantie, afhankelijk van de gebruikte verfsoort en ondergrond." },
      { vraag: "Moet ik zelf de ruimte leegmaken voor het schilderen?", antwoord: "Kleine spullen mogen blijven staan, wij dekken alles vakkundig af. Bij grote meubels vragen wij u deze indien mogelijk te verplaatsen." },
      { vraag: "Kan ik ook alleen advies krijgen zonder dat jullie het werk uitvoeren?", antwoord: "Zeker, wij bieden ook losse kleur- en materiaaladviezen aan huis." },
    ],
  },

  // --------------------------------------------------------------------
  // 10. CALL-TO-ACTION BAND (opvallende strook midden op de pagina)
  // --------------------------------------------------------------------
  ctaBand: {
    titel: "Klaar voor een fris resultaat?",
    tekst: "Plan vandaag nog een gratis en vrijblijvend inspectiebezoek in.",
    knop: { tekst: "Plan een afspraak", link: "#contact" },
  },

  // --------------------------------------------------------------------
  // 11. CONTACT
  // --------------------------------------------------------------------
  contact: {
    titel: "Neem contact op",
    intro: "Heeft u een vraag of wilt u een offerte aanvragen? Vul het formulier in of neem direct contact op.",
    telefoonnummer: "06 12345678",
    email: "info@jansenschilderwerken.nl",
    adres: "Dorpsstraat 12",
    postcode: "7311 AB",
    plaats: "Apeldoorn",
    openingstijden: [
      { dag: "Maandag – vrijdag", tijd: "07:30 – 17:00" },
      { dag: "Zaterdag", tijd: "Op afspraak" },
      { dag: "Zondag", tijd: "Gesloten" },
    ],
    formulier: {
      naamLabel: "Naam",
      emailLabel: "E-mailadres",
      telefoonLabel: "Telefoonnummer",
      berichtLabel: "Bericht",
      berichtPlaceholder: "Vertel ons kort waar we u mee kunnen helpen...",
      verzendKnopTekst: "Versturen",
      succesBericht: "Bedankt voor uw bericht! Wij nemen zo spoedig mogelijk contact met u op.",
      foutBericht: "Er ging iets mis bij het versturen. Controleer de gegevens en probeer het opnieuw.",
      verplichtVeldBericht: "Dit veld is verplicht.",
      ongeldigEmailBericht: "Vul een geldig e-mailadres in.",
    },
  },

  // --------------------------------------------------------------------
  // 12. LOCATIE
  // --------------------------------------------------------------------
  locatie: {
    titel: "Ons werkgebied",
    tekst: "Gevestigd in Apeldoorn, actief in de hele regio.",
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2454.207!2d5.9699!3d52.2112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEyJzQwLjMiTiA1wrA1OCcxMS42IkU!5e0!3m2!1snl!2snl!4v0",
  },

  // --------------------------------------------------------------------
  // 13. SOCIAL MEDIA
  // --------------------------------------------------------------------
  socialMedia: [
    { platform: "Facebook", url: "https://facebook.com/" },
    { platform: "Instagram", url: "https://instagram.com/" },
    { platform: "LinkedIn", url: "https://linkedin.com/" },
  ],

  // --------------------------------------------------------------------
  // 14. NAVIGATIE
  // --------------------------------------------------------------------
  navigatie: [
    { label: "Diensten", link: "#diensten" },
    { label: "Over ons", link: "#over-ons" },
    { label: "Ons werk", link: "#portfolio" },
    { label: "Reviews", link: "#reviews" },
    { label: "Veelgestelde vragen", link: "#faq" },
    { label: "Contact", link: "#contact" },
  ],
  navigatieKnop: { tekst: "Offerte aanvragen", link: "#contact" },

  // --------------------------------------------------------------------
  // 15. FOOTER
  // --------------------------------------------------------------------
  footer: {
    tekst: "Uw vertrouwde schildersbedrijf voor binnen- en buitenschilderwerk in de regio.",
    kolomLinks: {
      titel: "Snel naar",
      items: [
        { label: "Diensten", link: "#diensten" },
        { label: "Over ons", link: "#over-ons" },
        { label: "Ons werk", link: "#portfolio" },
        { label: "Contact", link: "#contact" },
      ],
    },
    copyright: "Alle rechten voorbehouden.",
    juridischeLinks: [
      { label: "Privacyverklaring", link: "#" },
      { label: "Algemene voorwaarden", link: "#" },
      { label: "Cookiebeleid", link: "#" },
    ],
  },

  // --------------------------------------------------------------------
  // 16. SECTIE-VOLGORDE
  // --------------------------------------------------------------------
  // Bepaalt welke secties worden getoond en in welke volgorde.
  // Verwijder een regel om een sectie te verbergen, of verplaats een regel
  // om de volgorde te wijzigen. "hero" staat altijd bovenaan en "footer"
  // altijd onderaan, dus die staan hier niet in.
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

  // --------------------------------------------------------------------
  // 17. SEO
  // --------------------------------------------------------------------
  seo: {
    titel: "Jansen Schilderwerken — Schilder in Apeldoorn en omgeving",
    beschrijving: "Vakkundig binnen- en buitenschilderwerk in Apeldoorn en omgeving. Gratis offerte, 5 jaar garantie. Vraag vandaag nog een afspraak aan.",
    taal: "nl",
  },
};
