/**
 * userTracking.js
 *
 * Ce module gère l'identification des utilisateurs et le suivi de leur activité
 * sur le site web en utilisant Firebase Firestore.
 *
 * Fonctionnalités :
 * - Attribution d'un UID unique basé sur un cookie, le localStorage et un fingerprint léger.
 * - Stockage et mise à jour des informations utilisateur (UID, IP, dates) dans Firestore.
 * - Suivi des activités de l'utilisateur (page views, clics, actions) avec limitation à 50 entrées.
 *
 * Pour l'intégrer dans une page HTML :
 * <script type="module">
 *    import { initUser, trackActivity } from "./js/userTracking.js";
 *    initUser();
 * </script>
 */

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
  } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
  
  /* -------------------- 1. Fonctions Utilitaires -------------------- */
  
  /**
   * Génère un UID simple basé sur le timestamp et un nombre aléatoire.
   * @returns {string} UID généré
   */
  function generateUID() {
    return "user_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Récupère un fingerprint léger en combinant le UserAgent et le fuseau horaire.
   * @returns {string} Fingerprint encodé en Base64
   */
  function getFingerprint() {
    const userAgent = navigator.userAgent;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return btoa(userAgent + "|" + timezone);
  }
  
  /**
   * Lit la valeur d'un cookie.
   * @param {string} name - Le nom du cookie.
   * @returns {string|undefined} La valeur du cookie ou undefined.
   */
  function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  
  /**
   * Crée ou met à jour un cookie.
   * @param {string} name - Nom du cookie.
   * @param {string} value - Valeur à stocker.
   * @param {number} days - Nombre de jours avant expiration.
   */
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
  }
  
  /* -------------------- 2. Initialisation de l'Utilisateur -------------------- */
  
  /**
   * Initialise l'utilisateur sur le site :
   * - Récupère ou génère un UID unique.
   * - Stocke cet UID dans un cookie et dans le localStorage.
   * - Crée ou met à jour le document Firestore de l'utilisateur dans la collection "users".
   * - Enregistre une activité "Page View" pour la page actuelle.
   *
   * @returns {Promise<string>} L'UID de l'utilisateur.
   */
  export async function initUser() {
    const db = getFirestore();
    const auth = getAuth();
  
    // Tentative de lecture du cookie et du localStorage
    let uid = getCookie("userUID") || localStorage.getItem("userUID");
  
    if (!uid) {
      // Aucun UID trouvé, en générer un nouveau avec un fingerprint
      uid = generateUID() + "_" + getFingerprint();
      setCookie("userUID", uid, 365);
      localStorage.setItem("userUID", uid);
    }
  
    // Récupérer l'IP publique via une API (optionnel)
    let ip = "";
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ip = data.ip;
    } catch (error) {
      console.warn("Impossible d'obtenir l'IP:", error);
    }
  
    // Référence vers le document de l'utilisateur dans Firestore
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const now = new Date().toISOString();
  
    if (userSnap.exists()) {
      // L'utilisateur existe : mettre à jour la date de dernière visite et ajouter l'IP si nécessaire
      const userData = userSnap.data();
      let updatedIPs = userData.ips || [];
      if (ip && !updatedIPs.includes(ip)) {
        updatedIPs.push(ip);
      }
      await updateDoc(userRef, {
        last_seen: now,
        ips: updatedIPs
      });
    } else {
      // Création du document utilisateur avec les informations initiales
      await setDoc(userRef, {
        uid: uid,
        ips: ip ? [ip] : [],
        last_seen: now,
        created_at: now,
        activity: []
      });
    }
  
    // Enregistrer une activité "Page View" dès l'initialisation
    trackActivity(uid, "Page View", { page: window.location.pathname });
  
    return uid;
  }
  
  /* -------------------- 3. Suivi d'Activité -------------------- */
  
  /**
   * Enregistre une activité de l'utilisateur dans Firestore.
   *
   * @param {string} uid - L'UID de l'utilisateur.
   * @param {string} action - L'action effectuée (ex. "Page View", "Bouton Cliqué").
   * @param {Object} metadata - Informations complémentaires (ex. { produit: "OnlyFans VIP", montant: 50 }).
   */
  export async function trackActivity(uid, action, metadata = {}) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();
  
    const activityEntry = {
      timestamp: now,
      action: action,
      page: window.location.pathname,
      metadata: metadata
    };
  
    // Récupération du document utilisateur pour mettre à jour le champ "activity"
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      let currentActivity = userData.activity || [];
      currentActivity.push(activityEntry);
  
      // Si plus de 50 actions, on conserve uniquement les 50 plus récentes
      if (currentActivity.length > 50) {
        currentActivity = currentActivity.slice(currentActivity.length - 50);
      }
  
      await updateDoc(userRef, {
        activity: currentActivity,
        last_seen: now
      });
    }
  }
  