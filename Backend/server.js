import express from "express";
import fs from "node:fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const path = "./data.json";

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'  // Frontend local
}));  

const readData = () => {
  const data = fs.readFileSync(path, "utf8");
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

app.get("/possession", (req, res) => {
  fs.readFile(path, "utf8", (err, data) => {
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

app.post("/possession", (req, res) => {
  const {
    possesseurNom,
    libelle,
    valeur,
    dateDebut,
    tauxAmortissement,
    jour,
    valeurConstante,
  } = req.body;

  if (!libelle || !valeur || !dateDebut) {
    return res.status(400).json({
      message: "Libellé, valeur, et date de début sont obligatoires.",
    });
  }

  const data = readData();
  const patrimoine = data.find(
    (item) =>
      item.model === "Patrimoine" && item.data.possesseur.nom === possesseurNom
  );

  if (!patrimoine) {
    return res
      .status(404)
      .json({ message: `Patrimoine pour ${possesseurNom} non trouvé.` });
  }

  // Trouver l'ID maximum existant et l'incrémenter de 1
  const maxId = patrimoine.data.possessions.reduce(
    (max, possession) => (possession.id > max ? possession.id : max),
    0
  );
  const newId = maxId + 1;

  // Créer la nouvelle possession avec l'ID incrémenté
  const newPossession = {
    id: newId,
    possesseur: { nom: possesseurNom },
    libelle,
    valeur,
    dateDebut,
    tauxAmortissement: tauxAmortissement || null,
    jour: jour || null,
    valeurConstante: valeurConstante || null,
    dateFin: null,
  };

  patrimoine.data.possessions.push(newPossession);
  writeData(data);
  res.status(201).json(newPossession);
});


app.put("/possession/:id", (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  console.log("ID reçu :", id);
  console.log("Données de mise à jour reçues :", req.body);

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "Aucun champ à mettre à jour." });
  }

  const data = readData();
  const patrimoine = data.find((item) => item.model === "Patrimoine");

  if (patrimoine) {
    const possession = patrimoine.data.possessions.find(
      (item) => item.id === parseInt(id)
    );

    if (possession) {
      Object.assign(possession, updateFields);
      writeData(data);
      res.status(200).json(possession);
    } else {
      res
        .status(404)
        .json({ message: `Possession avec libelle ${id} non trouvée.` });
    }
  } else {
    res.status(404).json({ message: "Patrimoine non trouvé." });
  }
});

app.put("/possession/:id/close", (req, res) => {
  const { id } = req.params;
  const data = readData();
  const patrimoine = data.find((item) => item.model === "Patrimoine");

  if (patrimoine) {
    const possession = patrimoine.data.possessions.find(
      (item) => item.id === parseInt(id)
    );

    if (possession) {
      possession.dateFin = new Date().toISOString().split("T")[0];
      writeData(data); 
      res.status(200).json(possession);
    } else {
      res
        .status(404)
        .json({ message: `Possession avec libelle ${id} non trouvée.` });
    }
  } else {
    res.status(404).json({ message: "Patrimoine non trouvé." });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
