// script.js

document.addEventListener("DOMContentLoaded", function() {
    const matchContainer = document.getElementById("match-container");

    // Fonction pour récupérer les données depuis l'API
    async function fetchMatchData() {
        try {
            console.log("Tentative de récupération des données via l'API Flask...");
            const response = await fetch('http://localhost:5000/api/matches');
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }
            const matches = await response.json();
            console.log("Données des matchs récupérées avec succès :", matches);

            displayMatches(matches);
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            matchContainer.innerHTML = "<p>Impossible de récupérer les données des matchs.</p>";
        }
    }

    // Fonction pour afficher les données des matchs
    function displayMatches(matches) {
        console.log("Affichage des données des matchs...");
        matchContainer.innerHTML = "";
        matches.forEach(match => {
            const matchCard = document.createElement("div");
            matchCard.classList.add("match-card");
            matchCard.innerHTML = `
                <h2>Match ID: ${match.match_id}</h2>
                <p><strong>Durée de la partie :</strong> ${match.game_duration} secondes</p>
                <p><strong>Mode de jeu :</strong> ${match.game_mode}</p>
                <p><strong>Région :</strong> ${match.region}</p>
                <p><strong>ADC Champion :</strong> ${match.match_data.adc_stats?.champion || "Non disponible"}</p>
                <p><strong>Support Champion :</strong> ${match.match_data.support_stats?.champion || "Non disponible"}</p>
                <p><strong>Dégâts de l'équipe alliée :</strong> ${match.match_data.team_damage?.allied}</p>
                <p><strong>Dégâts de l'équipe ennemie :</strong> ${match.match_data.team_damage?.enemy}</p>
            `;
            matchContainer.appendChild(matchCard);
        });
        console.log("Affichage terminé.");
    }

    // Appeler la fonction pour récupérer les données au chargement
    fetchMatchData();
});
