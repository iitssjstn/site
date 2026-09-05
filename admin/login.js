document.getElementById("login-formulier").addEventListener("submit", async (e) => {
  e.preventDefault();
  const foutEl = document.getElementById("foutmelding");
  foutEl.classList.remove("zichtbaar");

  const gebruikersnaam = document.getElementById("gebruikersnaam").value.trim();
  const wachtwoord = document.getElementById("wachtwoord").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gebruikersnaam, wachtwoord }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Inloggen is mislukt.");
    window.location.href = "/admin/";
  } catch (err) {
    foutEl.textContent = err.message;
    foutEl.classList.add("zichtbaar");
  }
});
