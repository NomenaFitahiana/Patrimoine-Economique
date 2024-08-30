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
} from "chart.js";
import Patrimoine from "../../../models/Patrimoine";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement
);

export default function PatrimoineGraph() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [day, setDay] = useState(1);
  const [patrimoine, setPatrimoine] = useState(null);

  const handleFetchData = () => {
    fetch("http://localhost:4000/possession")
      .then((result) => {
        if (!result.ok) {
          throw new Error("Erreur de réseau " + result.status);
        }
        return result.json();
      })
      .then((response) => {
        const possesseur = "John Doe";
        const patrimoineObj = new Patrimoine(possesseur, response);
        setPatrimoine(patrimoineObj);
        console.log(response);

        const labels = [];
        const values = [];

        for (let month = 0; month < 12; month++) {
          const date = new Date(year, month, day);
          labels.push(
            date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          );
          values.push(patrimoineObj.getValeur(date));
        }

        console.log(values);

        setData({
          labels: labels,
          datasets: [
            {
              label: `Valeur du Patrimoine à partir du ${day}-${year}`,
              data: values,
              borderColor: "#32CD32",
              backgroundColor: "rgba(50, 205, 50, 0.2)",
              fill: true,
              tension: 0.1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des données pour le graphique:",
          error
        );
      });
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
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valeur",
        },
        min: 0,
        max: 100000,
        ticks: {
          stepSize: 10000,
        },
      },
    },
  };

  return (
    <div className="container mt-5">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success">Graphique de Valeur du Patrimoine</h2>
        <Link to="/possessions" className="btn btn-primary">
          Retour à la liste des possessions
        </Link>
      </header>

      <div className="mb-3">
        <label>Année: </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label>Jour: </label>
        <input
          type="number"
          value={day}
          onChange={(e) => setDay(e.target.value)}
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
