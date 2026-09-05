/**
 * ============================================================================
 *  MAIN.JS
 *  Bouwt de pagina op uit config.js + render.js en regelt de interactie
 *  (mobiel menu, FAQ-accordeon, contactformulier-validatie).
 * ============================================================================
 */
(function () {
  const config = SITE_CONFIG;

  // ---------------------------------------------------- 1. Huisstijl toepassen
  function pasHuisstijlToe() {
    const root = document.documentElement.style;
    const k = config.stijl.kleuren;
    const f = config.stijl.lettertypes;
    root.setProperty("--kleur-primair", k.primair);
    root.setProperty("--kleur-primair-donker", k.primairDonker);
    root.setProperty("--kleur-accent", k.accent);
    root.setProperty("--kleur-inkt", k.inkt);
    root.setProperty("--kleur-inkt-zacht", k.inktZacht);
    root.setProperty("--kleur-papier", k.papier);
    root.setProperty("--kleur-papier-donker", k.papierDonker);
    root.setProperty("--kleur-lijn", k.lijn);
    root.setProperty("--font-uitgelicht", f.uitgelicht);
    root.setProperty("--font-basis", f.basis);
    root.setProperty("--radius", config.stijl.afronding);
  }

  // ---------------------------------------------------- 2. SEO / metadata
  function pasMetadataToe() {
    document.title = config.seo.titel;
    document.documentElement.lang = config.seo.taal || "nl";

    const beschrijving = document.querySelector('meta[name="description"]');
    if (beschrijving) beschrijving.setAttribute("content", config.seo.beschrijving);

    if (config.bedrijf.favicon) {
      const link = document.querySelector('link[rel="icon"]') || document.createElement("link");
      link.rel = "icon";
      link.href = config.bedrijf.favicon;
      document.head.appendChild(link);
    }
  }

  // ---------------------------------------------------- 3. Pagina opbouwen
  function bouwPagina() {
    document.getElementById("header-container").innerHTML = renderHeader(config);
    document.getElementById("hero-container").innerHTML = renderHero(config);

    const secties = document.getElementById("secties-container");
    secties.innerHTML = config.secties
      .map((id) => {
        const renderFn = SECTION_RENDERERS[id];
        if (!renderFn) {
          console.warn(`Onbekende sectie in config.secties: "${id}" — wordt overgeslagen.`);
          return "";
        }
        return renderFn(config);
      })
      .join("");

    document.getElementById("footer-container").innerHTML = renderFooter(config);
  }

  // ---------------------------------------------------- 4. Mobiel menu
  function initNavigatie() {
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---------------------------------------------------- 5. FAQ-accordeon
  function initFaq() {
    document.querySelectorAll("[data-faq-item]").forEach((item) => {
      const vraag = item.querySelector(".faq-vraag");
      const antwoord = item.querySelector(".faq-antwoord");
      vraag.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        // Sluit eventuele andere open vraag voor een rustig, overzichtelijk lijstje.
        item.parentElement.querySelectorAll(".faq-item.is-open").forEach((ander) => {
          if (ander !== item) {
            ander.classList.remove("is-open");
            ander.querySelector(".faq-vraag").setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", !isOpen);
        vraag.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  // ---------------------------------------------------- 6. Contactformulier
  function initContactformulier() {
    const form = document.getElementById("contact-formulier");
    if (!form) return;
    const teksten = config.contact.formulier;
    const melding = document.getElementById("formulier-melding");

    function toonVeldFout(veld, boodschap) {
      const wrapper = veld.closest(".formulier-veld");
      wrapper.classList.add("heeft-fout");
      wrapper.querySelector(".formulier-fout").textContent = boodschap;
    }
    function wisVeldFout(veld) {
      const wrapper = veld.closest(".formulier-veld");
      wrapper.classList.remove("heeft-fout");
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let geldig = true;

      const naam = form.querySelector("#veld-naam");
      const email = form.querySelector("#veld-email");
      const bericht = form.querySelector("#veld-bericht");

      [naam, email, bericht].forEach(wisVeldFout);

      if (!naam.value.trim()) {
        toonVeldFout(naam, teksten.verplichtVeldBericht);
        geldig = false;
      }
      if (!email.value.trim()) {
        toonVeldFout(email, teksten.verplichtVeldBericht);
        geldig = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        toonVeldFout(email, teksten.ongeldigEmailBericht);
        geldig = false;
      }
      if (!bericht.value.trim()) {
        toonVeldFout(bericht, teksten.verplichtVeldBericht);
        geldig = false;
      }

      melding.classList.remove("succes", "fout", "zichtbaar");

      if (!geldig) {
        melding.textContent = teksten.foutBericht;
        melding.classList.add("fout", "zichtbaar");
        return;
      }

      // LET OP: dit is een front-end demo. Koppel hier je eigen backend,
      // formulierdienst (bv. Formspree) of e-mail-API om berichten echt
      // te versturen.
      melding.textContent = teksten.succesBericht;
      melding.classList.add("succes", "zichtbaar");
      form.reset();
    });
  }

  // ---------------------------------------------------- Start
  document.addEventListener("DOMContentLoaded", () => {
    pasHuisstijlToe();
    pasMetadataToe();
    bouwPagina();
    initNavigatie();
    initFaq();
    initContactformulier();
  });
})();
