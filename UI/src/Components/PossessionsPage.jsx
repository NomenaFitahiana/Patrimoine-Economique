// src/Components/App.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPossessionModal from "./AddPossessionModal";
import EditPossessionForm from "./EditPossessionForm";
import Flux from "../../../models/possessions/Flux";
import Possession from "../../../models/possessions/Possession";
import "../Css/App.css";

export default function PossessionsPage() {
  const [tab, setTab] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalValeurActuelle, setTotalValeurActuelle] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
        setTab(response);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des données:", error);
      });
  }, []);

  const handleApplyClick = () => {
    if (!selectedDate) return;

    const updatedTab = tab.map((item) => {
      let valeurApresAmortissement;

      if (item.type === "Bien Materiel") {
        valeurApresAmortissement = new Possession(
          item.possesseur,
          item.libelle,
          item.valeur,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement
        ).getValeurApresAmortissement(selectedDate);
      } else {
        const flux = new Flux(
          item.possesseur,
          item.libelle,
          item.valeurConstante,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement,
          item.jour
        );
        valeurApresAmortissement = flux.getValeur(selectedDate);
      }

      return {
        ...item,
        dateFin: selectedDate.toISOString().split("T")[0],
        valeurActuelle:
          valeurApresAmortissement < 0
            ? valeurApresAmortissement * -1
            : valeurApresAmortissement,
      };
    });

    setTab(updatedTab);

    const total = updatedTab.reduce(
      (sum, item) => sum + item.valeurActuelle,
      0
    );
    setTotalValeurActuelle(total);
  };

  const handleNewPossessionClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handlePossessionAdded = (newPossession) => {
    setTab([...tab, newPossession]);
    setShowModal(false);
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

  const handleClosePossession = (libelle) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    fetch(`http://localhost:4000/possession/${libelle}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dateFin: formattedDate }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur de mise à jour " + response.status);
        }
        return response.json();
      })
      .then((updatedPossession) => {
        const updatedTab = tab.map((item) => {
          if (item.libelle === updatedPossession.libelle) {
            let valeurApresAmortissement;

            if (item.type === "Bien Materiel") {
              valeurApresAmortissement = new Possession(
                item.possesseur,
                item.libelle,
                item.valeur,
                new Date(item.dateDebut),
                currentDate,
                item.tauxAmortissement
              ).getValeurApresAmortissement(currentDate);
            } else {
              const flux = new Flux(
                item.possesseur,
                item.libelle,
                item.valeurConstante,
                new Date(item.dateDebut),
                currentDate,
                item.tauxAmortissement,
                item.jour
              );
              valeurApresAmortissement = flux.getValeur(currentDate);
            }

            return {
              ...updatedPossession,
              valeurActuelle:
                valeurApresAmortissement < 0
                  ? valeurApresAmortissement * -1
                  : valeurApresAmortissement,
              dateFin: formattedDate,
            };
          } else {
            return item;
          }
        });

        setTab(updatedTab);

        const total = updatedTab.reduce(
          (sum, item) => sum + item.valeurActuelle,
          0
        );
        setTotalValeurActuelle(total);
      })
      .catch((error) => {
        console.error("Erreur lors de la fermeture de la possession:", error);
      });
  };

  const handleDeletePossession = (libelle) => {
    fetch(`http://localhost:4000/possession/${libelle}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur de suppression " + response.status);
        }
        const updatedTab = tab.filter((item) => item.libelle !== libelle);
        setTab(updatedTab);

        const total = updatedTab.reduce(
          (sum, item) => sum + item.valeurActuelle,
          0
        );
        setTotalValeurActuelle(total);
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression de la possession:", error);
      });
  };

  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-success mb-4">Liste des Possessions</h1>
        <div>
          <Link to="/" className="btn btn-secondary me-2">
            Retour à l'accueil
          </Link>
          <button
            className="btn btn-primary"
            onClick={handleNewPossessionClick}
          >
            Nouvelle Possession
          </button>
          <Link to="/graphique" className="btn btn-info ms-2">
            {" "}
            {/* Lien vers PatrimoineGraph */}
            Voir le Graphique
          </Link>
        </div>
      </header>

      <AddPossessionModal
        show={showModal}
        handleClose={handleCloseModal}
        onPossessionAdded={handlePossessionAdded}
      />

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
              <th className="text-center">Libellé</th>
              <th className="text-center">Valeur initiale</th>
              <th className="text-center">Date début</th>
              <th className="text-center">Date fin</th>
              <th className="text-center">Amortissement</th>
              <th className="text-center">Valeur actuelle</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tab.length > 0 ? (
              tab.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{item.libelle}</td>
                  <td className="text-center">
                    {item.valeur
                      ? item.valeur
                      : item.valeurConstante < 0
                      ? item.valeurConstante * -1
                      : item.valeurConstante.toFixed(2)}
                  </td>
                  <td className="text-center">
                    {new Date(item.dateDebut).toLocaleDateString()}
                  </td>
                  <td className="text-center">
                    {item.dateFin
                      ? new Date(item.dateFin).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="text-center">
                    {item.tauxAmortissement
                      ? item.tauxAmortissement + "%"
                      : "N/A"}
                  </td>
                  <td className="text-center">
                    {item.valeurActuelle
                      ? item.valeurActuelle.toFixed(2)
                      : "N/A"}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEditClick(item)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn btn-danger mx-2"
                      onClick={() => handleClosePossession(item.libelle)}
                    >
                      Fermer
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeletePossession(item.libelle)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  Aucune possession trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          <strong>Total Valeur Actuelle: </strong>
          {totalValeurActuelle.toFixed(2)}
        </div>
        <div>
          <strong>Date d'application des valeurs: </strong>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
          <button className="btn btn-success m-2" onClick={handleApplyClick}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
