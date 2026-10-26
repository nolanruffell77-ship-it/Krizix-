// --- CONFIGURATION DISCORD & AUTH ---
const DISCORD_CLIENT_ID = "1511446139658965164";

// IDs Discord administrateurs de base
const BASE_ADMIN_IDS = [
    "1078676804010770512",
    "1222520269550260246",
    "883405254761267243"
];

// Vérification dynamique incluant les admins ajoutés via le panneau
function checkIsAdmin(userId) {
    if (!userId) return false;
    const userIdStr = String(userId).trim();
    const customAdmins = JSON.parse(localStorage.getItem('krizix_custom_admins') || '[]');
    const allAdmins = [...BASE_ADMIN_IDS, ...customAdmins];
    return allAdmins.includes(userIdStr);
}

function loginWithDiscord() {
    const targetUri = window.location.origin + "/index.html";
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(targetUri)}&response_type=token&scope=identify`;
    window.location.href = oauthUrl;
}

function logoutDiscord() {
    const user = JSON.parse(localStorage.getItem('krizix_user'));
    if (user) {
        sendAdminLog(user.username, "Déconnexion", "S'est déconnecté de la plateforme Krizix Esport.");
    }
    localStorage.removeItem('krizix_user');
    localStorage.removeItem('krizix_is_admin');
    window.location.href = window.location.origin + "/index.html";
}

async function handleOAuthCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        try {
            const res = await fetch('https://discord.com/api/users/@me', {
                headers: { authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const user = await res.json();
                if (user && user.id) {
                    localStorage.setItem('krizix_user', JSON.stringify(user));
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                    // Log de connexion sur Discord
                    sendAdminLog(user.username, "Connexion au site", "S'est connecté à la plateforme Krizix Esport.");

                    updateUI(user);
                    return;
                }
            }
        } catch (err) {
            console.error("Erreur Discord:", err);
        }
    }

    const savedUser = localStorage.getItem('krizix_user');
    if (savedUser) {
        try {
            updateUI(JSON.parse(savedUser));
        } catch(e) {
            localStorage.removeItem('krizix_user');
            renderLoginButton();
        }
    } else {
        renderLoginButton();
    }
}

function renderLoginButton() {
    const authNavItem = document.getElementById('auth-nav-item');
    if (!authNavItem) return;
    authNavItem.innerHTML = `
        <button type="button" class="btn-discord" onclick="loginWithDiscord()" style="position: relative; z-index: 99999; cursor: pointer;">
            <i class="fa-brands fa-discord"></i> Connexion
        </button>
    `;
}

function updateUI(user) {
    const authNavItem = document.getElementById('auth-nav-item');
    if (!authNavItem) return;

    const isAdmin = checkIsAdmin(user.id);

    // Active l'administration sur la page HTML (Rosters, Boutique, Club)
    if (isAdmin) {
        document.body.classList.add('is-admin');
        localStorage.setItem('krizix_is_admin', 'true');
    } else {
        document.body.classList.remove('is-admin');
        localStorage.removeItem('krizix_is_admin');
    }

    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

    // Calcul des suggestions non lues pour le badge de notification admin
    const suggestions = JSON.parse(localStorage.getItem('krizix_suggestions') || '[]');
    const viewedBy = JSON.parse(localStorage.getItem('krizix_viewed_suggestions') || '{}');
    const staffViewedList = viewedBy[user.id] || [];
    const unreadCount = suggestions.filter(s => !staffViewedList.includes(s.id)).length;

    authNavItem.innerHTML = `
        <div class="user-menu-wrapper" style="display: flex; align-items: center; gap: 15px; position: relative;">
            ${isAdmin ? `
                <a href="suggestions-admin.html" title="Voir les suggestions des membres" style="position: relative; display: flex; align-items: center; text-decoration: none; color: #fff;">
                    <i class="fa-regular fa-bell" style="font-size: 20px;"></i>
                    <span id="bell-badge-count" class="bell-badge" style="position: absolute; top: -6px; right: -8px; background: #e74c3c; color: #fff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 10px; border: 2px solid #090b0d; display: ${unreadCount > 0 ? 'inline-block' : 'none'};">${unreadCount}</span>
                </a>
                <div style="height: 20px; width: 1px; background: rgba(255,255,255,0.15);"></div>
            ` : ''}

            <div class="user-dropdown-btn" onclick="toggleUserDropdown(event)" style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); padding: 5px 14px 5px 6px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease;">
                <img src="${avatarUrl}" alt="${user.username}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <span style="color: #fff; font-weight: 700; font-size: 14px;">${user.username}</span>
                <i class="fa-solid fa-chevron-down" style="color: #8a9099; font-size: 11px; margin-left: 2px;"></i>
            </div>

            <!-- Menu Déroulant -->
            <div id="user-dropdown-menu" style="display: none; position: absolute; top: 120%; right: 0; width: 200px; background: #161a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 100000; backdrop-filter: blur(15px);">
                <div class="menu-item" onclick="window.location.href='profil.html'" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
                    <i class="fa-regular fa-user" style="font-size: 14px; width: 16px;"></i> Mon profil
                </div>
                <div class="menu-item" onclick="openSettingsModal()" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-gear" style="font-size: 14px; width: 16px;"></i> Paramètres
                </div>
                <div class="menu-item" onclick="openSuggestionModal()" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-bullhorn" style="font-size: 14px; width: 16px;"></i> Suggestion
                </div>
                <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 6px 0;"></div>
                <div class="menu-item" onclick="logoutDiscord()" style="display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; color: #e74c3c; font-size: 13px; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-right-from-bracket" style="font-size: 14px; width: 16px;"></i> Se déconnecter
                </div>
            </div>
        </div>
    `;

    injectModals(user);

    // Déclenche l'affichage de la barre d'administration flottante si elle existe
    const adminBar = document.getElementById('admin-floating-bar');
    if (adminBar) adminBar.style.display = isAdmin ? 'flex' : 'none';

    // Rétablissement immédiat des fonctions de rendu/édition sur les rosters et la boutique
    if (typeof renderRoster === 'function') renderRoster();
    if (typeof renderRosters === 'function') renderRosters();
    if (typeof initRosterAdmin === 'function') initRosterAdmin(isAdmin);
    if (typeof renderBoutiqueAdmin === 'function') renderBoutiqueAdmin(isAdmin);
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', () => {
    const menu = document.getElementById('user-dropdown-menu');
    if (menu) menu.style.display = 'none';
});

function injectModals(user) {
    if (document.getElementById('krizix-global-modals')) return;

    const modalHTML = `
        <div id="krizix-global-modals">
            <div class="modal-overlay" id="modal-suggestion" style="display:none; position:fixed; inset:0; background:rgba(9,11,13,0.85); backdrop-filter:blur(10px); z-index:200000; align-items:center; justify-content:center;">
                <div style="background:#161a1e; border:1px solid rgba(46,204,113,0.3); border-radius:20px; width:90%; max-width:450px; padding:30px; color:#fff;">
                    <h3 style="font-family:'Bebas Neue'; font-size:2rem; margin-bottom:15px;">Proposer une Suggestion</h3>
                    <textarea id="suggestion-text" rows="4" placeholder="Votre idée pour améliorer le site ou le club..." style="width:100%; padding:12px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; outline:none; font-family:inherit; resize:none; margin-bottom:20px;"></textarea>
                    <div style="display:flex; gap:10px;">
                        <button type="button" onclick="closeModal('modal-suggestion')" style="flex:1; padding:12px; background:rgba(255,255,255,0.08); border:none; border-radius:10px; color:#fff; font-weight:700; cursor:pointer;">Annuler</button>
                        <button type="button" onclick="sendSuggestion('${user.id}', '${user.username}')" style="flex:1; padding:12px; background:#2ecc71; border:none; border-radius:10px; color:#000; font-weight:800; cursor:pointer;">Envoyer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openSettingsModal() { 
    window.location.href = "parametre.html"; 
}

function openSuggestionModal() { 
    document.getElementById('modal-suggestion').style.display = 'flex'; 
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
}

// Fonction globale universelle pour l'envoi de logs vers Discord (Boutique, Rosters, Connexion)
async function sendAdminLog(username, actionTitle, actionDetails) {
    // 1. Sauvegarde locale dans LocalStorage
    const logs = JSON.parse(localStorage.getItem('krizix_admin_logs') || '[]');
    logs.unshift({
        user: username,
        action: actionTitle,
        details: actionDetails,
        date: new Date().toLocaleString('fr-FR')
    });
    localStorage.setItem('krizix_admin_logs', JSON.stringify(logs.slice(0, 100)));

    // 2. Envoi vers le serveur Webhook / Bot Discord local
    try {
        await fetch('http://fi4.bot-hosting.cloud:25145/api/send-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                action: actionTitle,
                details: actionDetails
            })
        });
    } catch (e) {
        console.warn("Serveur de logs local temporairement injoignable.");
    }
}
window.sendAdminLog = sendAdminLog;

// Helper spécifique pour logger les actions Boutique (Création, Modification, Suppression)
function logBoutiqueAction(actionType, itemTitle) {
    const user = JSON.parse(localStorage.getItem('krizix_user'));
    const username = user ? user.username : 'Admin';
    sendAdminLog(username, `Boutique : ${actionType}`, `Action exécutée sur l'article "${itemTitle}".`);
}
window.logBoutiqueAction = logBoutiqueAction;

function sendSuggestion(userId, username) {
    const text = document.getElementById('suggestion-text').value.trim();
    if (!text) return alert("Veuillez écrire une suggestion.");

    const suggestions = JSON.parse(localStorage.getItem('krizix_suggestions') || '[]');
    const newSug = {
        id: Date.now().toString(),
        authorId: userId,
        author: username,
        text: text,
        date: new Date().toLocaleDateString('fr-FR')
    };
    suggestions.push(newSug);
    localStorage.setItem('krizix_suggestions', JSON.stringify(suggestions));

    sendAdminLog(username, "Nouvelle Suggestion", `A posté une suggestion : "${text}"`);

    alert("Merci ! Votre suggestion a été transmise.");
    document.getElementById('suggestion-text').value = '';
    closeModal('modal-suggestion');
    location.reload();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleOAuthCallback);
} else {
    handleOAuthCallback();
}
