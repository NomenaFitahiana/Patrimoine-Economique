// src/Components/WelcomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function WelcomePage() {
  const [possesseur, setPossesseur] = useState("");

  useEffect(() => {
    fetch(`http://localhost:4000/possession`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          setPossesseur(data[0].possesseur.nom);
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération du possesseur:", error)
      );
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <header className="mb-4">
          <h1 className="text-success mb-4">Bienvenue, {possesseur}!</h1>
        </header>
        <div className="mt-4">
          <Link to="/possessions" className="btn btn-primary">
            Voir vos possessions
          </Link>
        </div>
      </div>
    </div>
  );
}
