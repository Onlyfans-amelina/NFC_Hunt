 Exemple de Code à Ajouter dans chaque page HTML
html
Copier
Modifier
<head>
  <meta charset="UTF-8">
  <title>Ma Page</title>

  <!-- Utilisation de JavaScript pour injecter la version -->
  <script>
    const VERSION = "1.0";  // Cette ligne sera mise à jour par le script Python
  </script>

  <!-- Chargement du CSS avec la version -->
  <link id="global-css" rel="stylesheet" href="/css/globalStyles.css?v=1.0">

  <!-- Chargement des scripts JS avec la version -->
  <script>
    document.getElementById("global-css").href = `/css/globalStyles.css?v=${VERSION}`;

    const script1 = document.createElement("script");
    script1.src = `/js/userTracking.js?v=${VERSION}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = `/js/otherModule.js?v=${VERSION}`;
    document.head.appendChild(script2);
  </script>