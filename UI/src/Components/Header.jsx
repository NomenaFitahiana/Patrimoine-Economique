import { Link } from "react-router-dom";

export default function Header({handleNewPossessionClick}) {
  return (
    <header className="d-flex justify-content-between align-items-center mb-4">
      <h1 className="text-success mb-4">Liste des Possessions</h1>
      <div>
        <Link to="/" className="btn btn-secondary me-2">
          Retour à l'accueil
        </Link>
        <button className="btn btn-primary" onClick={handleNewPossessionClick}>
          Nouvelle Possession
        </button>
        <Link to="/graphique" className="btn btn-info ms-2">
          Voir le Graphique
        </Link>
      </div>
    </header>
  );
}
