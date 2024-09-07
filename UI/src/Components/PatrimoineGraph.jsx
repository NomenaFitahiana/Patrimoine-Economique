import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";

import Flux from  "../../models/possessions/Flux";
import Possession from  "../../models/possessions/Possession";
import Argent from  "../../models/possessions/Argent";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
);

export default function PatrimoineGraph() {
  const [data, setData] = useState(null);
  const [annee1, setAnnee1] = useState(new Date().getFullYear());
  const [annee2, setAnnee2] = useState(new Date().getFullYear());
  const [jour, setJour] = useState(1);
  const [possessions, setPossessions] = useState([]);

  const handleFetchData = () => {
    fetch(`${import.meta.env.VITE_URL_API }/possession`)
      .then((result) => {
        if (!result.ok) {
          throw new Error("Erreur de réseau " + result.status);
        }
        return result.json();
      })
      .then((response) => {
        setPossessions(response);
        console.log("possessions récupérées :", response);
        calculateAndGenerateGraph(response); 
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des données pour le graphique:",
          error
        );
      });
  };

  function calculateValue(possessions, selectedDate) {
    let totalValue = 0;

    possessions.forEach((item) => {
      let valeurApresAmortissement = 0;

      if (item.valeurConstante) {
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
      } else if (item.libelle === "Compte épargne") {
        const argent = new Argent(
          item.possesseur,
          item.libelle,
          item.valeur,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement,
          "Epargne"
        );
        valeurApresAmortissement = argent.getValeurApresAmortissement(selectedDate);
      } else {
        const possession = new Possession(
          item.possesseur,
          item.libelle,
          item.valeur,
          new Date(item.dateDebut),
          selectedDate,
          item.tauxAmortissement
        );
        valeurApresAmortissement = possession.getValeurApresAmortissement(selectedDate);
      }

      totalValue += valeurApresAmortissement;
    });

    return totalValue;
  }

  const calculateAndGenerateGraph = (possessions) => {
    if (possessions.length > 0) {
      const labels = [];
      const values = [];

      for (let year = annee1; year <= annee2; year++) {
        for (let month = 0; month < 12; month++) {
          const date = new Date(year, month, jour);
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

          labels.push(formattedDate);
          const value = calculateValue(possessions, date); 
          values.push(value);
        }
      }

      const newData = {
        labels: labels,
        datasets: [
          {
            label: `Valeur du Patrimoine entre ${annee1} et ${annee2}`,
            data: values,
            borderColor: "#32CD32",
            backgroundColor: "rgba(50, 205, 50, 0.2)",
            fill: true,
            tension: 0.1,
          },
        ],
      };

      setData(newData);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valeur",
        },
        min: 0,
        ticks: {
          stepSize: 10000,
        },
      },
    },
  };

  return (
    <div
      className="container mt-5"
      style={{
        backgroundColor: "#2E2E2E",
        border: "2px solid #32CD32",
        borderRadius: "8px",
        color: "white",
        height: "600px",
        width: "100%",
      }}
    >
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success">Graphique de Valeur du Patrimoine</h2>
        <Link to="/possessions" className="btn btn-primary">
          Retour à la liste des possessions
        </Link>
      </header>

      <div className="mb-3">
        <label>Année de début: </label>
        <input
          type="number"
          value={annee1}
          onChange={(e) => setAnnee1(parseInt(e.target.value) || 0)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <input
          type="number"
          value={annee2}
          onChange={(e) => setAnnee2(parseInt(e.target.value) || 0)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Jour du mois: </label>
        <input
          type="number"
          value={jour}
          onChange={(e) => setJour(parseInt(e.target.value) || 1)}
          min="1"
          max="31"
          className="form-control"
        />
      </div>

      <button onClick={handleFetchData} className="btn btn-success mb-4">
        Générer le Graphique
      </button>

      <div
        className="chart-container p-4"
        style={{
          backgroundColor: "#2E2E2E",
          border: "2px solid #32CD32",
          borderRadius: "8px",
          color: "white",
          height: "400px",
        }}
      >
        {data ? (
          <Line data={data} options={options} />
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
    </div>
  );
}
