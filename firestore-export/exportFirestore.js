const admin = require("firebase-admin");
const fs = require("fs");

// 🔹 Charger la clé Firebase (Assurez-vous que `serviceAccountKey.json` est correct)
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 🔹 Initialisation de Firestore
const db = admin.firestore();

/**
 * Fonction récursive pour extraire l’arborescence Firestore.
 * @param {string} path - Chemin Firestore actuel.
 * @returns {Object} - Structure JSON de la base Firestore.
 */
async function listCollectionsAndDocs(path = "") {
    let structure = {};

    if (path === "") {
        // 🔹 Récupère toutes les collections de la racine
        const rootCollections = await db.listCollections();
        for (const collection of rootCollections) {
            structure[collection.id] = await listCollectionsAndDocs(collection.id);
        }
    } else {
        // 🔹 Liste les documents de la collection actuelle
        const documents = await db.collection(path).listDocuments();
        for (const doc of documents) {
            structure[doc.id] = {};
            const subCollections = await doc.listCollections();
            for (const subCollection of subCollections) {
                structure[doc.id][subCollection.id] = await listCollectionsAndDocs(`${path}/${doc.id}/${subCollection.id}`);
            }
        }
    }
    return structure;
}

/**
 * Fonction principale pour exporter l’arborescence Firestore.
 */
async function exportFirestoreTree() {
    console.log("📡 Extraction de la structure Firestore en cours...");
    
    const tree = await listCollectionsAndDocs();
    fs.writeFileSync("firestore_structure.json", JSON.stringify(tree, null, 2));

    console.log("✅ Arborescence Firestore exportée dans `firestore_structure.json` !");
}

// 🔹 Exécuter l’export
exportFirestoreTree().then(() => process.exit());
