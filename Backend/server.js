import express from "express";
import fs from "node:fs";
import path from "node:path"; // Ajouter l'importation de `path`
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json()); // Ajouter le middleware pour parser le JSON

const dataFilePath = path.join(__dirname, "../data/data.json");

// Fonction pour lire les données depuis le fichier JSON
// const readData = () => {
//   const data = fs.readFileSync(dataFilePath, "utf8");
//   return JSON.parse(data);
// };

// // Fonction pour écrire les données dans le fichier JSON
// const writeData = (data) => {
//   fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
// };

app.get("/possession", (req, res) => {
  fs.readFile(dataFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur de lecture des données" });
    }

    const result = JSON.parse(data);
    const patrimoine = result.find((item) => item.model === "Patrimoine");

    if (patrimoine) {
      res.json(patrimoine.data.possessions);
    } else {
      res.status(404).json({ message: "Patrimoine non trouvé" });
    }
  });
});

// Route pour créer une nouvelle possession
// app.post("/possession", (req, res) => {
//   const {
//     possesseurNom,
//     libelle,
//     valeur,
//     dateDebut,
//     tauxAmortissement,
//     jour,
//     valeurConstante,
//   } = req.body;

//   if (!libelle || !valeur || !dateDebut) {
//     return res.status(400).json({
//       message: "Libellé, valeur, et date de début sont obligatoires.",
//     });
//   }

//   const newPossession = {
//     possesseur: { nom: possesseurNom },
//     libelle,
//     valeur,
//     dateDebut,
//     tauxAmortissement: tauxAmortissement || null,
//     jour: jour || null,
//     valeurConstante: valeurConstante || null,
//     dateFin: null,
//   };

//   const data = readData();
//   const patrimoine = data.find(
//     (item) =>
//       item.model === "Patrimoine" && item.data.possesseur.nom === possesseurNom
//   );

//   if (patrimoine) {
//     patrimoine.data.possessions.push(newPossession);
//     writeData(data);
//     res.status(201).json(newPossession);
//   } else {
//     res
//       .status(404)
//       .json({ message: `Patrimoine pour ${possesseurNom} non trouvé.` });
//   }
// });

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
