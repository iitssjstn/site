document.getElementById("setup-formulier").addEventListener("submit", async (e) => {
  e.preventDefault();
  const foutEl = document.getElementById("foutmelding");
  foutEl.classList.remove("zichtbaar");

  const gebruikersnaam = document.getElementById("gebruikersnaam").value.trim();
  const wachtwoord = document.getElementById("wachtwoord").value;
  const wachtwoordHerhaal = document.getElementById("wachtwoord-herhaal").value;

  if (wachtwoord !== wachtwoordHerhaal) {
    foutEl.textContent = "De wachtwoorden komen niet overeen.";
    foutEl.classList.add("zichtbaar");
    return;
  }

  try {
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gebruikersnaam, wachtwoord }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Aanmaken is mislukt.");
    window.location.href = "/admin/";
  } catch (err) {
    foutEl.textContent = err.message;
    foutEl.classList.add("zichtbaar");
  }
});
