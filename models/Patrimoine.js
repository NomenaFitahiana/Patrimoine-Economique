import Possession from "./possessions/Possession";

export default class Patrimoine {
  constructor(possesseur, possessions) {
    this.possesseur = possesseur;
    this.possessions = possessions.map((possession) => {
      return new Possession(
        possession.possesseur,
        possession.libelle,
        possession.valeur,
        new Date(possession.dateDebut),
        new Date(possession.dateFin),
        possession.tauxAmortissement
      );
    });// [Possession, Possession, ...]
  }
  getValeur(date) {
    let result = 0;
    for (let item of this.possessions) {
      result += item.getValeur(date);
    }
    return result;
  }
  addPossession(possession) {
    if (possession.possesseur != this.possesseur) {
      console.log(
        `${possession.libelle} n'appartient pas à ${this.possesseur}`,
      );
    } else {
      this.possessions.push(possession);
    }
  }
  removePossession(possession) {
    this.possessions = this.possessions.filter(
      (p) => p.libelle !== possession.libelle,
    );
  }
}
