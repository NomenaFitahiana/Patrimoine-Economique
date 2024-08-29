import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPossessionsForm from "./Components/AddPossessionsForm";
import EditPossessionForm from "./Components/EditPossessionForm"; // Importation du modal de modification
import Flux from "../../models/possessions/Flux";
import Possession from "../../models/possessions/Possession";

export default function App() {
  const [tab, setTab] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalValeurActuelle, setTotalValeurActuelle] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // État pour afficher le modal de modification
  const [currentPossession, setCurrentPossession] = useState(null);

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
        setTab(response);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
      });
  }, []);

  const handleApplyClick = () => {
    let updatedTab = [];
    if (selectedDate) {
      updatedTab = tab.map((item) => {
        let valeurApresAmortissement;

        if (item.type === "Bien Materiel") {
          // Appel de la méthode getValeurApresAmortissement pour recalculer la valeur
          valeurApresAmortissement = new Possession(
            item.possesseur,
            item.libelle,
            item.valeur,
            new Date(item.dateDebut),
            selectedDate, // Utilisation de la date sélectionnée
            item.tauxAmortissement
          ).getValeurApresAmortissement(selectedDate);
        } else {
          // Création de l'objet Flux pour calculer la valeur
          const flux = new Flux(
            item.possesseur,
            item.libelle,
            item.valeurConstante,
            new Date(item.dateDebut),
            selectedDate, // Utilisation de la date sélectionnée
            item.tauxAmortissement,
            item.jour
          );
          valeurApresAmortissement = flux.getValeur(selectedDate);
        }

        return {
          ...item,
          dateFin: selectedDate.toISOString().split("T")[0],
          valeurActuelle: valeurApresAmortissement,
        };
      });
      console.log("log:" + updatedTab);
      setTab(updatedTab);

      // Calcul du total de la valeur actuelle
      const total = updatedTab.reduce(
        (sum, item) => sum + item.valeurActuelle,
        0
      );
      setTotalValeurActuelle(total);
    }
  };

  const handleNewPossessionClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePossessionAdded = (newPossession) => {
    setTab([...tab, newPossession]);
  };

  const handleEditClick = (item) => {
    setCurrentPossession(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handlePossessionUpdated = (updatedPossession) => {
    setTab(
      tab.map((item) =>
        item.libelle === updatedPossession.libelle ? updatedPossession : item
      )
    );
  };

  // Nouvelle fonction pour fermer une possession (set dateFin à la date actuelle)
  const handleClosePossession = (libelle) => {
    const currentDate = new Date().toISOString().split("T")[0]; // Date actuelle

    fetch(`http://localhost:4000/possession/${libelle}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dateFin: currentDate }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur de mise à jour " + response.status);
        }
        return response.json();
      })
      .then((updatedPossession) => {
        // Mise à jour de l'état local avec la possession mise à jour
        handlePossessionUpdated(updatedPossession);

        // Recalculer la valeur actuelle
        const updatedTab = tab.map((item) =>
          item.libelle === updatedPossession.libelle
            ? {
                ...updatedPossession,
                valeurActuelle: item.getValeur(new Date(currentDate)),
              }
            : item
        );

        setTab(updatedTab);
      })
      .catch((error) => {
        console.error("Erreur lors de la fermeture de la possession:", error);
      });
  };

  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-success mb-4">Liste des Possessions</h1>
        <button className="btn btn-primary" onClick={handleNewPossessionClick}>
          Nouvelle Possession
        </button>
      </header>

      <AddPossessionsForm
        show={showModal}
        handleClose={handleCloseModal}
        onPossessionAdded={handlePossessionAdded}
      />

      {/* Modal pour modifier une possession */}
      {currentPossession && (
        <EditPossessionForm
          show={showEditModal}
          handleClose={handleCloseEditModal}
          possession={currentPossession}
          onPossessionUpdated={handlePossessionUpdated}
        />
      )}

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
              <th>Actions</th> {/* Ajouter une colonne pour les actions */}
            </tr>
          </thead>
          <tbody>
            {tab.map((item, index) => (
              <tr key={index}>
                <td>{item.libelle}</td>
                <td>
                  {item.valeur
                    ? item.valeur
                    : item.valeurConstante < 0
                    ? item.valeurConstante * -1
                    : item.valeurConstante}
                </td>
                <td>{item.dateDebut}</td>
                <td>{item.dateFin || "Non définie"}</td>
                <td>{item.tauxAmortissement}</td>
                <td>
                  {item.valeurActuelle < 0
                    ? item.valeurActuelle * -1
                    : item.valeurActuelle || 0}
                </td>
                <td>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleEditClick(item)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn btn-danger ml-2"
                    onClick={() => handleClosePossession(item.libelle)}
                  >
                    Fermer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
