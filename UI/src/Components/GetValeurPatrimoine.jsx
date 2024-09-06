export default GetValeurPatrimoine(){
    const updatedTab = tab.map((item) => {
        let valeurApresAmortissement;
    
        if (item.valeurConstante) {
          // Utiliser Flux si tauxAmortissement est null
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
          console.log( "FLUX" + valeurApresAmortissement);
        
  
        } else if (item.libelle === "Compte épargne") {
          // Utiliser Argent si libelle est "Compte épargne"
          const argent = new Argent(
            item.possesseur,
            item.libelle,
            item.valeur,
            new Date(item.dateDebut),
            selectedDate,
            item.tauxAmortissement,
            "Epargne" // Type pour Argent
          );
          valeurApresAmortissement = argent.getValeurApresAmortissement(selectedDate);
          console.log( "argent: " + valeurApresAmortissement);
  
        } else {
          // Utiliser Possession pour les autres cas
          const possession = new Possession(
            item.possesseur,
            item.libelle,
            item.valeur,
            new Date(item.dateDebut),
            selectedDate,
            item.tauxAmortissement
          );
          valeurApresAmortissement = possession.getValeurApresAmortissement(selectedDate);
          console.log("possession" + valeurApresAmortissement);
  
        }
    
        return {
          ...item,
          dateFin: selectedDate.toISOString().split("T")[0],
          valeurActuelle: valeurApresAmortissement,
        };
      });
}