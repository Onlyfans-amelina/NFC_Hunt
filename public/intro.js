// intro.js
// Module pour gérer le header, le bandeau et le pop‑up 18+ avec des logs pour le débogage

export function initIntro() {
  console.log("initIntro: Début d'initialisation");

  // Création dynamique du header et du bandeau
  const headerHTML = `
    <div id="fixed-header">
      <a href="https://onlyfans.com/amelina_xo" target="_blank">
        🔥 Mon OnlyFans à -50% ! 🔥<br>
        👉 Clique ici et rejoins-moi maintenant.
      </a>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  console.log("initIntro: Header ajouté au DOM");

  // Création dynamique du pop‑up de vérification d’âge
  const agePopupHTML = `
    <div id="age-popup">
      <div id="age-popup-content">
        <p>Êtes-vous majeur (18 ans et plus) ?</p>
        <button id="age-yes">Oui, j'ai 18 ans</button>
        <button id="age-no">Non</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', agePopupHTML);
  console.log("initIntro: Pop-up d'âge ajouté au DOM");

  // Vérification via cookies : afficher le pop‑up uniquement à la première visite
  if (!document.cookie.split('; ').find(row => row.startsWith("ageVerified="))) {
    document.getElementById("age-popup").style.display = "flex";
    console.log("initIntro: Cookie non trouvé, pop-up affiché");
  } else {
    console.log("initIntro: Cookie trouvé, pop-up non affiché");
  }

  // Gestion des clics sur les boutons du pop‑up
  document.getElementById("age-yes").addEventListener("click", () => {
    document.cookie = "ageVerified=true; path=/; max-age=" + (60 * 60 * 24 * 365);
    document.getElementById("age-popup").style.display = "none";
    console.log("initIntro: Bouton 'Oui' cliqué, cookie défini, pop-up masqué");
  });
  document.getElementById("age-no").addEventListener("click", () => {
    console.log("initIntro: Bouton 'Non' cliqué, redirection vers Google");
    window.location.href = "https://www.google.com";
  });

  console.log("initIntro: Initialisation terminée");
}
