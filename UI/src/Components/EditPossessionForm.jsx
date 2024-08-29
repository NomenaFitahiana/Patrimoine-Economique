import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Possession from "../../../models/possessions/Possession"; // Assurez-vous que ce chemin est correct
import Flux from "../../../models/possessions/Flux"; // Assurez-vous que ce chemin est correct

function EditPossessionForm({
  show,
  handleClose,
  possession,
  onPossessionUpdated,
}) {
  const [libelle, setLibelle] = useState(possession.libelle || "");
  const [valeur, setValeur] = useState(possession.valeur || "");
  const [dateDebut, setDateDebut] = useState(possession.dateDebut || "");
  const [dateFin, setDateFin] = useState(possession.dateFin || "");
  const [tauxAmortissement, setTauxAmortissement] = useState(
    possession.tauxAmortissement || ""
  );
  const [type, setType] = useState(possession.type || "");

  useEffect(() => {
    setLibelle(possession.libelle || "");
    setValeur(possession.valeur || "");
    setDateDebut(possession.dateDebut || "");
    setDateFin(possession.dateFin || "");
    setTauxAmortissement(possession.tauxAmortissement || "");
    setType(possession.type || "");
  }, [possession]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    if (libelle !== possession.libelle) updatedData.libelle = libelle;
    if (valeur !== possession.valeur) updatedData.valeur = valeur;
    if (dateDebut !== possession.dateDebut) updatedData.dateDebut = dateDebut;
    if (dateFin !== possession.dateFin) updatedData.dateFin = dateFin;
    if (tauxAmortissement !== possession.tauxAmortissement)
      updatedData.tauxAmortissement = tauxAmortissement;
    if (type !== possession.type) updatedData.type = type;

    if (Object.keys(updatedData).length === 0) {
      console.log("Aucune modification apportée.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:4000/possession/${possession.libelle}`,
        updatedData
      );

      // Recalculer la valeur actuelle après la mise à jour
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
        valeurActuelle, // Mise à jour de la valeur actuelle
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

          <Form.Group controlId="formValeur">
            <Form.Label>Valeur</Form.Label>
            <Form.Control
              type="number"
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formDateDebut">
            <Form.Label>Date de début</Form.Label>
            <Form.Control
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
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

          <Form.Group controlId="formTauxAmortissement">
            <Form.Label>Taux d'Amortissement</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={tauxAmortissement}
              onChange={(e) => setTauxAmortissement(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formType">
            <Form.Label>Type</Form.Label>
            <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Sélectionnez un type</option>
              <option value="Flux">Flux</option>
              <option value="Bien Materiel">Bien Materiel</option>
            </Form.Select>
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
