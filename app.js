import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.addEventListener('DOMContentLoaded', () => {
    const savedId = localStorage.getItem('prediction_user_id');
    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true;
        saveIdBtn.textContent = "Change 🔄";
    }
    loadMatches();
    loadLeaderboard();
});

saveIdBtn.addEventListener('click', () => {
    if (userIdInput.disabled) {
        userIdInput.disabled = false;
        userIdInput.focus();
        saveIdBtn.textContent = "Save 💾";
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
        loadLeaderboard();
    }
});

// 1. جلب المباريات
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="glass p-6 rounded-xl text-center text-slate-500">No matches available.</div>`;
            return;
        }

        const now = new Date();
        querySnapshot.forEach((docSnap) => {
            const match = docSnap.data();
            const matchId = docSnap.id;
            const matchTime = match.matchTime ? match.matchTime.toDate() : new Date();
            const isStarted = now >= matchTime;

            const card = document.createElement('div');
            card.className = "glass p-4 rounded-xl space-y-3 shadow-md";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 w-1/3">
                        <img src="${match.homeLogo}" class="w-10 h-10 object-contain bg-slate-950 p-1 rounded-lg">
                        <span class="font-bold text-sm">${match.homeTeam}</span>
                    </div>
                    <div class="text-center w-1/3">
                        <span class="text-[10px] text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-full border border-sky-900/50">
                            ${isStarted ? '🔴 Started' : matchTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 w-1/3 justify-end">
                        <span class="font-bold text-sm text-right">${match.awayTeam}</span>
                        <img src="${match.awayLogo}" class="w-10 h-10 object-contain bg-slate-950 p-1 rounded-lg">
                    </div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = "flex gap-2 pt-2";
            const opts = [{l: 'Home Win', v: '1'}, {l: 'Draw', v: 'X'}, {l: 'Away Win', v: '2'}];

            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-2 rounded-lg text-xs font-bold border transition ${isStarted ? 'bg-slate-950 text-slate-600 border-slate-900' : 'bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300'}`;
                btn.textContent = opt.l;
                if (!isStarted) btn.onclick = () => submitPrediction(matchId, opt.v, btn);
                actions.appendChild(btn);
            });
            card.appendChild(actions);
            container.appendChild(card);
        });
    } catch (e) { console.error(e); }
}

// 2. إرسال التوقع
async function submitPrediction(matchId, choice, btnElement) {
    const userId = localStorage.getItem('prediction_user_id');
    if (!userId) { alert("⚠️ Please save your ID first!"); userIdInput.focus(); return; }

    try {
        await setDoc(doc(db, "predictions", `${userId}_${matchId}`), {
            userId, matchId, prediction: choice, timestamp: new Date()
        });
        
        const userRef = doc(db, "leaderboard", userId);
        if (!(await getDoc(userRef)).exists()) await setDoc(userRef, { userId, totalPoints: 0 });

        btnElement.parentElement.querySelectorAll('button').forEach(b => b.classList.replace('bg-sky-600', 'bg-slate-900'));
        btnElement.classList.replace('bg-slate-900', 'bg-sky-600');
        
        alert(`✅ Prediction saved!`);
        loadLeaderboard();
    } catch (e) { alert("❌ Error saving prediction."); }
}

// 3. جلب الترتيب وتمييز اسم المستخدم بلون مختلف
async function loadLeaderboard() {
    const container = document.getElementById('leaderboardContainer');
    const currentUserId = localStorage.getItem('prediction_user_id');

    try {
        const q = query(collection(db, "leaderboard"), orderBy("totalPoints", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            container.innerHTML = `<p class="text-slate-500 text-center py-2 text-xs">No rankings yet.</p>`;
            return;
        }

        let html = `<table class="w-full text-left text-xs">`;
        let rank = 1;

        snap.forEach(docSnap => {
            const data = docSnap.data();
            const isMe = data.userId === currentUserId;

            // إذا كان هو أنت، نلون السطر بالأزرق المميز ونكتب بجانبه (You)
            html += `
                <tr class="${isMe ? 'bg-sky-500/20 border-l-2 border-sky-400 font-bold text-sky-300' : 'text-slate-300'} border-b border-slate-800/60">
                    <td class="py-2.5 px-2">#${rank++}</td>
                    <td class="py-2.5 px-2">${data.userId} ${isMe ? '👑 (You)' : ''}</td>
                    <td class="py-2.5 px-2 text-right text-cyan-400">${data.totalPoints || 0} pts</td>
                </tr>`;
        });
        html += `</table>`;
        container.innerHTML = html;
    } catch (e) { console.error(e); }
}
