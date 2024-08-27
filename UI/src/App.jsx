import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPossessionsForm from "./Components/AddPossessionsForm"; // Importation du modal

function getValeurApresAmortissement(
  dateDebut,
  dateActuelle,
  valeurInitiale,
  tauxAmortissement
) {
  if (dateActuelle < dateDebut) {
    return 0;
  }

  const differenceDate = {
    year: dateActuelle.getFullYear() - dateDebut.getFullYear(),
    month: dateActuelle.getMonth() - dateDebut.getMonth(),
    day: dateActuelle.getDate() - dateDebut.getDate(),
  };

  const nombreAnnees =
    differenceDate.year + differenceDate.month / 12 + differenceDate.day / 365;
  const valeurApresAmortissement =
    valeurInitiale * (1 - (tauxAmortissement / 100) * nombreAnnees);

  return Math.max(valeurApresAmortissement, 0);
}

export default function App() {
  const [tab, setTab] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalValeurActuelle, setTotalValeurActuelle] = useState(0);
  const [showModal, setShowModal] = useState(false); // État pour contrôler l'affichage du modal

  useEffect(() => {
    fetch("http://localhost:4000/possession")
      .then((result) => {
        if (!result.ok) {
          throw new Error("Erreur de réseau " + result.status);
        }
        return result.json();
      })
      .then((response) => {
        console.log("Données reçues:", response);
        setTab(response.data.possessions);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
      });
  }, []);

  const handleApplyClick = () => {
    if (selectedDate) {
      const updatedTab = tab.map((item, index) => {
        const valeurApresAmortissement = getValeurApresAmortissement(
          new Date(item.dateDebut),
          selectedDate,
          item.valeur,
          item.tauxAmortissement
        );
        return {
          ...item,
          dateFin: selectedDate.toISOString().split("T")[0],
          valeurActuelle: valeurApresAmortissement,
        };
      });

      setTab(updatedTab);

      const total = updatedTab.reduce(
        (sum, item) => sum + item.valeurActuelle,
        0
      );
      setTotalValeurActuelle(total);
    }
  };

  const handleNewPossessionClick = () => {
    setShowModal(true); // Affiche le modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Ferme le modal
  };

  const handlePossessionAdded = (newPossession) => {
    setTab([...tab, newPossession]); // Ajoute la nouvelle possession à la liste
  };

  return (
    <div className="container mt-5">
      {/* Header avec le titre et le bouton pour ajouter une nouvelle possession */}
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-success mb-4">Liste des Possessions</h1>
        <button className="btn btn-primary" onClick={handleNewPossessionClick}>
          Nouvelle Possession
        </button>
      </header>

      {/* Modal pour ajouter une nouvelle possession */}
      <AddPossessionsForm
        show={showModal}
        handleClose={handleCloseModal}
        onPossessionAdded={handlePossessionAdded}
      />

      {/* Liste des possessions avec le DatePicker */}
      <div className="table-responsive mt-4">
        <table className="table table-bordered table-hover table-striped">
          <thead className="thead-dark">
            <tr>
              <th>Libellé</th>
              <th>Valeur initiale</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Amortissement</th>
              <th>Valeur actuelle</th>
            </tr>
          </thead>
          <tbody>
            {tab.map((item, index) => (
              <tr key={index}>
                <td>{item.libelle}</td>
                <td>{item.valeur}</td>
                <td>{item.dateDebut}</td>
                <td>{item.dateFin || "Non définie"}</td>
                <td>{item.tauxAmortissement}</td>
                <td>{item.valeurActuelle || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DatePicker pour appliquer les modifications */}
      <div className="mt-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Sélectionner une date"
          className="form-control"
        />
        <button
          className="btn btn-success m-2"
          onClick={handleApplyClick}
          disabled={!selectedDate}
        >
          Appliquer
        </button>
      </div>

      {/* Affichage du total de la valeur actuelle */}
      {totalValeurActuelle > 0 && (
        <div className="mt-3">
          <h4 className="text-primary">
            Total Valeur Actuelle: {totalValeurActuelle}
          </h4>
        </div>
      )}
    </div>
  );
}
