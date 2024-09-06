import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddPossessionModal from "./AddPossessionModal";
import EditPossessionForm from "./EditPossessionForm";
import "../Css/App.css";
import Header from "./Header";
import useNewPossesion from "../Hooks/useNewPossession";

export default function PossessionsPage() {
  const [
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
  ] = useNewPossesion();

  return (
    <div className="container mt-5">
      <Header handleNewPossessionClick={handleNewPossessionClick} />

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
          {totalValeurActuelle}
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
