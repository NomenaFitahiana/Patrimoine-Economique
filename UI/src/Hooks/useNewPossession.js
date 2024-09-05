import { useEffect, useState } from "react";
import Flux from "../../../models/possessions/Flux";
import Possession from "../../../models/possessions/Possession";

export default function useNewPossesion() {
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

  return [
    tab,
    setTab,
    selectedDate,
    setSelectedDate,
    totalValeurActuelle,
    setTotalValeurActuelle,
    showModal,
    setShowModal,
    showEditModal,
    setShowEditModal,
    currentPossession,
    setCurrentPossession,
    handleDeletePossession,
    handleClosePossession,
    handlePossessionUpdated,
    handleCloseEditModal,
    handleEditClick,
    handlePossessionAdded,
    handleCloseModal,
    handleNewPossessionClick,
    handleApplyClick,
  ];
}
