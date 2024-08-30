import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Possession from "../../../models/possessions/Possession";
import Flux from "../../../models/possessions/Flux";

function EditPossessionForm({
  show,
  handleClose,
  possession,
  onPossessionUpdated,
}) {
  const [libelle, setLibelle] = useState(possession.libelle || "");

  const [dateFin, setDateFin] = useState(possession.dateFin || "");

  useEffect(() => {
    setLibelle(possession.libelle || "");

    setDateFin(possession.dateFin || "");
  }, [possession]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    if (libelle !== possession.libelle) updatedData.libelle = libelle;

    if (dateFin !== possession.dateFin) updatedData.dateFin = dateFin;

    if (Object.keys(updatedData).length === 0) {
      console.log("Aucune modification apportée.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/possession/${possession.libelle}`,
        updatedData
      );

      let valeurActuelle = possession.valeurActuelle;
      if (type === "Bien Materiel") {
        const possessionObj = new Possession(
          possession.possesseur,
          libelle,
          valeur,
          new Date(dateDebut),
          new Date(dateFin),
          tauxAmortissement
        );
        valeurActuelle = possessionObj.getValeurApresAmortissement(
          new Date(dateFin)
        );
      } else if (type === "Flux") {
        const fluxObj = new Flux(
          possession.possesseur,
          libelle,
          valeur,
          new Date(dateDebut),
          new Date(dateFin),
          tauxAmortissement,
          possession.jour
        );
        valeurActuelle = fluxObj.getValeur(new Date(dateFin));
      }

      onPossessionUpdated({
        ...possession,
        ...updatedData,
        valeurActuelle,
      });
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la possession:", error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Modifier la Possession</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formLibelle">
            <Form.Label>Libellé</Form.Label>
            <Form.Control
              type="text"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formDateFin">
            <Form.Label>Date de fin</Form.Label>
            <Form.Control
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-2">
            Enregistrer les modifications
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditPossessionForm;
