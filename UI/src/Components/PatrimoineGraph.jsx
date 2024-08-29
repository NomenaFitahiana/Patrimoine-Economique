// src/Components/PatrimoineGraph.jsx
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function PatrimoineGraph() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/possession")
      .then((result) => {
        if (!result.ok) {
          throw new Error("Erreur de réseau " + result.status);
        }
        return result.json();
      })
      .then((response) => {
        const labels = response.map((item) =>
          new Date(item.dateDebut).toLocaleDateString()
        );
        const values = response.map((item) => item.valeurActuelle || 0);

        setData({
          labels: labels,
          datasets: [
            {
              label: "Valeur Actuelle",
              data: values,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
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
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-success mb-4">Graphique de Valeur du Patrimoine</h2>
      <div className="chart-container">
        <Line data={data} />
      </div>
    </div>
  );
}
