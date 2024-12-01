import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
// Initialisation du client Supabase
const supabaseUrl = 'https://sbqsbhlietaddodamzkt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNicXNiaGxpZXRhZGRvZGFtemt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5ODY5NzIsImV4cCI6MjA0ODU2Mjk3Mn0.l6rPXqAPjxYQUgQJLoeohBWaIBc0M7m32yhDSvDISSs';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
    fetchMatchData();

    // Fonction pour récupérer les données des matchs via Supabase
    async function fetchMatchData() {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .limit(50);

            if (error) {
                throw new Error(`Erreur lors de la récupération des données : ${error.message}`);
            }

            console.log("Données récupérées :", data);
            displayMatches(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des données via Supabase :", error);
        }
    }

    // Fonction pour afficher les matchs dans le tableau
    function displayMatches(matches) {
        const matchTableBody = document.getElementById("matchTableBody");
        matchTableBody.innerHTML = "";

        if (!matches || matches.length === 0) {
            matchTableBody.innerHTML = `<tr><td colspan="6">Aucun match trouvé.</td></tr>`;
            return;
        }

        matches.forEach((match, index) => {
            const row = document.createElement("tr");

            // Trouver le personnage joué par le propriétaire du compte
            const player = match.match_data?.bot_lanes?.allied.find(p => p.is_owner);
            const championPlayed = player ? player.champion : "Non disponible";

            // Déterminer la classe CSS à appliquer au résultat
            const resultClass = match.match_data?.win ? 'victoire' : 'defaite';

            // Mettre à jour l'ordre des cellules dans le tableau
            row.innerHTML = `
                <td>Partie ${index + 1}</td>
                <td>${championPlayed}</td>
                <td>${new Date(match.game_creation).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</td>
                <td>${Math.floor(match.game_duration / 60)}m ${match.game_duration % 60}s</td>
                <td>Ranked</td>
                <td class="${resultClass}">${match.match_data?.win ? 'Victoire' : 'Défaite'}</td>
            `;
            row.addEventListener("click", () => openMatchModal(match));
            matchTableBody.appendChild(row);
        });
    }

    // Fonction pour ouvrir la modale avec les détails du match
    function openMatchModal(match) {
        const modal = document.getElementById("matchModal");
        const modalContent = document.getElementById("modalMatchDetails");

        // Convertir le timestamp en date lisible
        const gameDate = match.game_creation ? new Date(match.game_creation).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) : 'Date non disponible';

        modalContent.innerHTML = `
            <h2>Partie ${match.match_id}</h2>
            <div class="match-info">
                <div class="infoGame">
                    <p><strong>Date de la partie :</strong> ${gameDate}</p>
                    <p><strong>Durée de la partie :</strong> ${Math.floor(match.game_duration / 60)}m ${match.game_duration % 60}s</p>
                    <p><strong>Mode de jeu :</strong> Ranked</p>
                    <p><strong>Région :</strong> Europe</p>
                    <p><strong>Résultat :</strong> ${match.match_data?.win ? 'Victoire' : 'Défaite'}</p>
                </div>
                <div class="team-composition-container">
                    <div class="team-composition">
                        <h4>Équipe Alliée :</h4>
                        <div class="team-images">
                            ${match.match_data?.team_composition?.allied.map(champion => `
                                <img class="champion-image-team" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/champion/${champion}.png" alt="${champion}">
                            `).join('') ?? ''}
                        </div>
                    </div>
                    <div class="team-composition">
                        <h4>Équipe Adverse :</h4>
                        <div class="team-images">
                            ${match.match_data?.team_composition?.enemy.map(champion => `
                                <img class="champion-image-team" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/champion/${champion}.png" alt="${champion}">
                            `).join('') ?? ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="bot-lane-container">
                <div class="bot-lane-section allied">
                    <h3>Allied Bot Lane :</h3>
                    ${match.match_data?.bot_lanes?.allied.map(player => `
                        <div class="bot-lane-player ${player.is_owner ? 'owner-highlight' : ''}">
                            <p><strong>Rôle :</strong> ${player.role}</p>
                            <p><strong>Champion :</strong> ${player.champion}</p>
                            <img class="champion-image" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/champion/${player.champion}.png" alt="Champion Image">
                            ${player.is_owner ? `<p><strong>Joué par :</strong> Rekkles</p>` : ''}
                            <p><strong>Score de vision :</strong> ${player.vision_score}</p>
                            ${player.role === 'Support' ? `<p><strong>Score de vision par minute :</strong> ${(player.vision_score / (match.game_duration / 60)).toFixed(2)}</p>` : ''}
                            ${player.role === 'ADC' ? `
                            <p><strong>CS :</strong> ${player.cs ?? 'Non disponible'} (${player.cs_per_min?.toFixed(2) ?? 'N/A'} par minute)</p>
                            <p><strong>Dégâts infligés :</strong> ${player.damage_dealt ?? 'Non disponible'}</p>` : ''}
                            <p><strong>Kills / Morts / Assists :</strong> ${player.kills} / ${player.deaths} / ${player.assists}</p>
                            <p><strong>KDA :</strong> ${((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2)}</p>
                            <div class="item-list">
                                ${player.items?.filter(item => item !== 0).map(item => `
                                    <img class="item-image" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/item/${item}.png" alt="Item ${item}">
                                `).join('') ?? ''}
                            </div>
                        </div>
                    `).join('') ?? ''}
                </div>
                <div class="bot-lane-section enemy">
                    <h3>Enemy Bot Lane :</h3>
                    ${match.match_data?.bot_lanes?.enemy.map(player => `
                        <div class="bot-lane-player">
                            <p><strong>Rôle :</strong> ${player.role}</p>
                            <p><strong>Champion :</strong> ${player.champion}</p>
                            <img class="champion-image" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/champion/${player.champion}.png" alt="Champion Image">
                            <p><strong>Score de vision :</strong> ${player.vision_score}</p>
                            ${player.role === 'Support' ? `<p><strong>Score de vision par minute :</strong> ${(player.vision_score / (match.game_duration / 60)).toFixed(2)}</p>` : ''}
                            ${player.role === 'ADC' ? `
                            <p><strong>CS :</strong> ${player.cs ?? 'Non disponible'} (${player.cs_per_min?.toFixed(2) ?? 'N/A'} par minute)</p>
                            <p><strong>Dégâts infligés :</strong> ${player.damage_dealt ?? 'Non disponible'}</p>` : ''}
                            <p><strong>Kills / Morts / Assists :</strong> ${player.kills} / ${player.deaths} / ${player.assists}</p>
                            <p><strong>KDA :</strong> ${((player.kills + player.assists) / Math.max(1, player.deaths)).toFixed(2)}</p>
                            <div class="item-list">
                                ${player.items?.filter(item => item !== 0).map(item => `
                                    <img class="item-image" src="https://ddragon.leagueoflegends.com/cdn/14.22.1/img/item/${item}.png" alt="Item ${item}">
                                `).join('') ?? ''}
                            </div>
                        </div>
                    `).join('') ?? ''}
                </div>
            </div>
        `;
        modal.style.display = "block";
    }

    // Fonction pour fermer la modale
    function closeMatchModal() {
        const modal = document.getElementById("matchModal");
        modal.style.display = "none";
    }

    // Ajouter un gestionnaire d'événement au bouton de fermeture de la modale
    document.getElementById("closeModal").addEventListener("click", closeMatchModal);

    // Fermer la modale lorsqu'on clique en dehors de celle-ci
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("matchModal");
        if (event.target === modal) {
            closeMatchModal();
        }
    });
});
