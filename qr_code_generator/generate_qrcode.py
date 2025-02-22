import qrcode
from PIL import Image
import os
import svgwrite

# Déterminer le répertoire où sauvegarder les fichiers
script_dir = os.path.dirname(os.path.abspath(__file__))
png_path = os.path.join(script_dir, "qrcode_9mm.png")
svg_path = os.path.join(script_dir, "qrcode_9mm.svg")

print("Répertoire de travail :", script_dir)

# Étape 1 : Vérification du lancement du script
print("Script lancé !")

# URL simplifiée
data = "https://amelina-a6063.web.app/?hunt=hunt_00125"

# Étape 2 : Génération du QR Code avec les meilleurs paramètres pour la lisibilité
print("Génération du QR Code en cours...")
qr = qrcode.QRCode(
    version=1,  # Taille minimale pour un QR Code simple
    error_correction=qrcode.constants.ERROR_CORRECT_L,  # Correction faible pour réduire la densité
    box_size=10,  # Augmente la taille des pixels pour une meilleure précision
    border=0  # Ajoute une petite bordure pour éviter la découpe des bords
)
qr.add_data(data)
qr.make(fit=True)

# Étape 3 : Conversion en image avec un contraste maximal
print("Conversion du QR Code en image...")
img = qr.make_image(fill="#000000", back_color="#FFFFFF")

# Désactiver l'antialiasing
img = img.convert("1")  # Mode 1-bit noir et blanc pur

# Étape 4 : Sauvegarde en PNG avec la qualité maximale et sans compression
print(f"Sauvegarde du QR Code en PNG : {png_path}")
img.save(png_path, "PNG", optimize=False, compress_level=0)

# Étape 5 : Génération du fichier SVG avec une précision maximale
print(f"Sauvegarde du QR Code en SVG : {svg_path}")
dwg = svgwrite.Drawing(svg_path, profile='tiny', size=(f"{img.width}px", f"{img.height}px"))

# Ajout des carrés noirs sur le SVG (évite les erreurs de compression)
matrix = qr.modules
for y, row in enumerate(matrix):
    for x, col in enumerate(row):
        if col:  # Si le pixel est noir
            dwg.add(dwg.rect(insert=(f"{x * 10}px", f"{y * 10}px"), size=("10px", "10px"), fill="#000000"))

# Sauvegarde du SVG
dwg.save()

# Étape 6 : Vérification finale
print(f"QR Code sauvegardé avec succès en PNG : {png_path}")
print(f"QR Code sauvegardé avec succès en SVG : {svg_path}")
