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

// 1. جلب المباريات مع تكبير اللوغوهات
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
            card.className = "glass p-5 rounded-2xl space-y-4 shadow-xl border border-sky-500/20";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <!-- الفريق المضيف -->
                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <img src="${match.homeLogo}" class="w-16 h-16 object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        <span class="font-bold text-sm text-white">${match.homeTeam}</span>
                    </div>

                    <!-- التوقيت أو الحالة -->
                    <div class="text-center w-1/3 space-y-1">
                        <span class="text-[10px] uppercase font-bold text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-900/50 shadow">
                            ${isStarted ? '🔴 Started' : matchTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <div class="text-xs text-slate-500 font-semibold">VS</div>
                    </div>

                    <!-- الفريق الضيف -->
                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <img src="${match.awayLogo}" class="w-16 h-16 object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        <span class="font-bold text-sm text-white">${match.awayTeam}</span>
                    </div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = "flex gap-2 pt-2";
            const opts = [{l: 'Home Win', v: '1'}, {l: 'Draw', v: 'X'}, {l: 'Away Win', v: '2'}];

            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${isStarted ? 'bg-slate-950 text-slate-600 border-slate-900' : 'bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300'}`;
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

// 3. جلب الترتيب مع بطاقة Fantasy العلوية والجدول العام
async function loadLeaderboard() {
    const tableContainer = document.getElementById('leaderboardContainer');
    const myCardContainer = document.getElementById('myRankCard');
    const currentUserId = localStorage.getItem('prediction_user_id');

    try {
        const q = query(collection(db, "leaderboard"), orderBy("totalPoints", "desc"));
        const snap = await getDocs(q);

        if (snap.empty) {
            tableContainer.innerHTML = `<p class="text-slate-500 text-center py-2 text-xs">No rankings yet.</p>`;
            if(myCardContainer) myCardContainer.innerHTML = `<span class="text-xs text-slate-400">Save your ID to see your rank.</span>`;
            return;
        }

        let rank = 1;
        let myData = null;
        let myRank = 0;
        let tableHtml = `<table class="w-full text-left text-xs">`;
        const players = [];

        snap.forEach(docSnap => {
            players.push(docSnap.data());
        });

        players.forEach(data => {
            const isMe = data.userId === currentUserId;
            if (isMe) {
                myData = data;
                myRank = rank;
            }

            tableHtml += `
                <tr class="${isMe ? 'bg-sky-500/20 border-l-2 border-sky-400 font-bold text-sky-300' : 'text-slate-300'} border-b border-slate-800/60">
                    <td class="py-2.5 px-2">#${rank}</td>
                    <td class="py-2.5 px-2">${data.userId} ${isMe ? '👑' : ''}</td>
                    <td class="py-2.5 px-2 text-right text-cyan-400">${data.totalPoints || 0} pts</td>
                </tr>`;
            rank++;
        });
        tableHtml += `</table>`;
        if(tableContainer) tableContainer.innerHTML = tableHtml;

        // عرض بطاقة Fantasy الخاصة بك في الأعلى
        if (myCardContainer) {
            if (currentUserId) {
                if (myData) {
                    myCardContainer.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="bg-sky-500 text-slate-950 font-black px-3 py-2 rounded-lg text-sm shadow">
                                #${myRank}
                            </div>
                            <div>
                                <div class="text-xs text-sky-300 font-semibold">Your Rank & Stats</div>
                                <div class="text-sm font-bold text-white">${myData.userId} 👑</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] uppercase text-slate-400 tracking-wider">Total Points</div>
                            <div class="text-lg font-black text-cyan-400">${myData.totalPoints || 0} pts</div>
                        </div>
                    `;
                } else {
                    myCardContainer.innerHTML = `
                        <div class="text-xs text-amber-400 py-1">
                            ⚠️ ID (${currentUserId}) not found in rankings yet. Make a prediction!
                        </div>
                    `;
                }
            } else {
                myCardContainer.innerHTML = `
                    <div class="text-xs text-slate-400 py-1">
                        🔍 Enter and save your ID above to track your personal rank.
                    </div>
                `;
            }
        }

    } catch (e) { 
        console.error(e); 
    }
}
