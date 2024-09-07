import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Possession from "../../models/possessions/Possession";
import Flux from  "../../models/possessions/Flux";
import { useNavigate } from "react-router-dom";

export default function EditPossessionForm({
  show,
  handleClose,
  possession,
  onPossessionUpdated,
}) {
  const [libelle, setLibelle] = useState(possession.libelle || "");

  const [dateFin, setDateFin] = useState(possession.dateFin || "");

  const navigate = useNavigate();

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

    console.log(possession.libelle);
    console.log(updatedData.libelle);
    console.log(possession.id);

    try {
      await axios.put(
        `${import.meta.env.VITE_URL_API }/possession/${possession.id}`,
        updatedData
      );

      let valeurActuelle = possession.valeurActuelle;

      if (possession.valeurConstante === null) {
        const possessionObj = new Possession(
          possession.possesseur,
          possession.libelle,
          possession.valeur,
          new Date(possession.dateDebut),
          new Date(possession.dateFin),
          possession.tauxAmortissement
        );
        valeurActuelle = possessionObj.getValeurApresAmortissement(
          new Date(dateFin)
        );
      } else {
        const fluxObj = new Flux(
          possession.possesseur,
          possession.libelle,
          possession.valeur,
          new Date(possession.dateDebut),
          new Date(possession.dateFin),
          possession.tauxAmortissement,
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
      navigate(0);
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
