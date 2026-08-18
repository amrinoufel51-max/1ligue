// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBmh4fqvWpGLietTIESEyd6BkTCtMnMquw",
    authDomain: "league-91565.firebaseapp.com",
    projectId: "league-91565",
    storageBucket: "league-91565.firebasestorage.app",
    messagingSenderId: "923003244062",
    appId: "1:923003244062:web:a2bf91b86de0d1bf73a80f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userIdInput = document.getElementById('currentUserId');
const saveIdBtn = document.getElementById('saveIdBtn');

// Auto-load saved ID
window.addEventListener('DOMContentLoaded', () => {
    const savedId = localStorage.getItem('prediction_user_id');
    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true;
        saveIdBtn.textContent = "Change 🔄";
    }
});

// Save or Change ID
saveIdBtn.addEventListener('click', () => {
    if (userIdInput.disabled) {
        userIdInput.disabled = false;
        userIdInput.focus();
        saveIdBtn.textContent = "Save ID 💾";
        localStorage.removeItem('prediction_user_id');
    } else {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert("⚠️ Please enter your ID first!");
            return;
        }
        localStorage.setItem('prediction_user_id', userId);
        userIdInput.disabled = true;
        saveIdBtn.textContent = "Change 🔄";
        alert("✅ ID saved successfully!");
    }
});

// 1. Load Matches
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="glass p-6 rounded-2xl border border-slate-800 text-center text-slate-500">No matches available.</div>`;
            return;
        }

        const now = new Date();
        querySnapshot.forEach((docSnap) => {
            const match = docSnap.data();
            const matchId = docSnap.id;
            const matchTime = match.matchTime ? match.matchTime.toDate() : new Date();
            const isStarted = now >= matchTime;

            const cardWrapper = document.createElement('div');
            cardWrapper.className = "glass border border-slate-700/50 p-5 rounded-2xl shadow-lg space-y-4";
            cardWrapper.innerHTML = `
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3 w-full md:w-1/3 justify-start">
                        <img src="${match.homeLogo}" class="w-12 h-12 object-contain bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                        <span class="font-bold">${match.homeTeam}</span>
                    </div>
                    <div class="text-center w-full md:w-1/3">
                        <span class="text-[10px] uppercase tracking-widest text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                            ${isStarted ? '🔴 Match Started' : matchTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <div class="flex items-center gap-3 w-full md:w-1/3 justify-end">
                        <span class="font-bold">${match.awayTeam}</span>
                        <img src="${match.awayLogo}" class="w-12 h-12 object-contain bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                    </div>
                </div>
            `;

            const actionsDiv = document.createElement('div');
            actionsDiv.className = "flex gap-2 w-full justify-center pt-2";
            const options = [{l: 'Win Home', v: '1'}, {l: 'Draw', v: 'X'}, {l: 'Win Away', v: '2'}];

            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-2 rounded-xl text-xs font-bold border transition ${isStarted ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed' : 'bg-slate-900 border-slate-700 hover:border-emerald-500 hover:text-emerald-400'}`;
                btn.textContent = opt.l;
                if (!isStarted) btn.onclick = () => submitPrediction(matchId, opt.v, btn);
                actionsDiv.appendChild(btn);
            });
            cardWrapper.appendChild(actionsDiv);
            container.appendChild(cardWrapper);
        });
    } catch (e) { console.error(e); }
}

// 2. Submit Prediction
async function submitPrediction(matchId, choice, btnElement) {
    const userId = localStorage.getItem('prediction_user_id');
    if (!userId) { alert("⚠️ Please save your ID first!"); userIdInput.focus(); return; }

    try {
        await setDoc(doc(db, "predictions", `${userId}_${matchId}`), {
            userId, matchId, prediction: choice, timestamp: new Date()
        });
        
        const userRef = doc(db, "leaderboard", userId);
        if (!(await getDoc(userRef)).exists()) await setDoc(userRef, { userId, totalPoints: 0 });

        btnElement.parentElement.querySelectorAll('button').forEach(b => b.classList.replace('bg-emerald-500', 'bg-slate-900'));
        btnElement.classList.replace('bg-slate-900', 'bg-emerald-500');
        
        alert(`✅ Prediction (${choice}) saved!`);
        loadLeaderboard();
    } catch (e) { alert("❌ Error saving prediction."); }
}

// 3. Load Leaderboard
async function loadLeaderboard() {
    const tableBody = document.getElementById('leaderboardTable');
    try {
        const q = query(collection(db, "leaderboard"), orderBy("totalPoints", "desc"));
        const snap = await getDocs(q);
        tableBody.innerHTML = "";
        let rank = 1;
        snap.forEach(docSnap => {
            const data = docSnap.data();
            tableBody.innerHTML += `<tr><td class="py-3 text-emerald-400 font-bold">#${rank++}</td><td class="py-3">${data.userId}</td><td class="py-3 text-right font-bold text-cyan-400">${data.totalPoints || 0}</td></tr>`;
        });
    } catch (e) { console.error(e); }
}

loadMatches();
loadLeaderboard();
