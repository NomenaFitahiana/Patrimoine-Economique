import { useEffect, useState } from "react";
import Flux from  "../../models/possessions/Flux";
import Possession from  "../../models/possessions/Possession";
import Argent from  "../../models/possessions/Argent";

const apiURL = import.meta.env.VITE_URL_API 

export default function useNewPossesion() {
  const [tab, setTab] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalValeurActuelle, setTotalValeurActuelle] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPossession, setCurrentPossession] = useState(null);

  useEffect(() => {
    fetch(`${apiURL }/possession`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
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
  
      if (item.valeurConstante) {
        // Utiliser Flux si tauxAmortissement est null
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
        console.log( "FLUX" + valeurApresAmortissement);
      

      } else if (item.libelle === "Compte épargne") {
        // Utiliser Argent si libelle est "Compte épargne"
        const argent = new Argent(
          item.possesseur,
          item.libelle,
          item.valeur,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement,
          "Epargne" // Type pour Argent
        );
        valeurApresAmortissement = argent.getValeurApresAmortissement(selectedDate);
        console.log( "argent: " + valeurApresAmortissement);

      } else {
        // Utiliser Possession pour les autres cas
        const possession = new Possession(
          item.possesseur,
          item.libelle,
          item.valeur,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement
        );
        valeurApresAmortissement = possession.getValeurApresAmortissement(selectedDate);
        console.log("possession" + valeurApresAmortissement);

      }
  
      return {
        ...item,
        dateFin: selectedDate.toISOString().split("T")[0],
        valeurActuelle: valeurApresAmortissement,
      };
    });
  
    setTab(updatedTab);

    console.log(updatedTab);
  
    const total = updatedTab.reduce(
      (sum, item) => sum +( item.valeurActuelle),
      0
    ).toFixed(2);
    console.log(total);
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

  const handleClosePossession = (id) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    fetch(`${apiURL }/possession/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dateFin: formattedDate }),
    })
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          throw new Error("Erreur de mise à jour " + response.status);
        }
        return response.json();
      })
      .then((updatedPossession) => {
        const updatedTab = tab.map((item) => {
          if (item.id === updatedPossession.id) {
            let valeurApresAmortissement;

              if(item.valeurConstante == null){
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

      console.log("ID de la possession à fermer:", id);

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
