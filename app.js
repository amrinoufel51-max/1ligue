import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const userContactInput = document.getElementById('userContact');
const contactContainer = document.getElementById('contactContainer');
const saveIdBtn = document.getElementById('saveIdBtn');

window.addEventListener('DOMContentLoaded', () => {
    const savedId = localStorage.getItem('prediction_user_id');
    const savedContact = localStorage.getItem('prediction_user_contact');

    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true;
        
        // إذا كان مسجلاً من قبل، نخفي خانة الاتصال تماماً من الواجهة
        if (contactContainer) {
            contactContainer.style.display = 'none';
        }

        saveIdBtn.textContent = "Identity Locked 🔒 (Change ID)";
    }
    loadMatches();
    loadLeaderboard();
});

// زر الحفظ
saveIdBtn.addEventListener('click', () => {
    if (userIdInput.disabled) {
        // إذا أراد فك القفل وتغيير الـ ID (نعيد إظهار خانة الاتصال لو أردت أو نتركها مخفية ونكتفي بالـ ID)
        userIdInput.disabled = false;
        userIdInput.focus();
        saveIdBtn.textContent = "Save Identity 💾";
        localStorage.removeItem('prediction_user_id');
        // ملاحظة: لا نحذف رقم الهاتف من الذاكرة لكي يبقى مسجلاً في القاعدة
    } else {
        const userId = userIdInput.value.trim();
        const userContact = userContactInput.value.trim();

        if (!userId) {
            alert("⚠️ Please enter your unique ID!");
            userIdInput.focus();
            return;
        }
        if (!userContact) {
            alert("⚠️ Please enter your phone number or email so we can contact you if you win!");
            userContactInput.focus();
            return;
        }

        checkAndSaveUser(userId, userContact);
    }
});

// حفظ البيانات في قاعدة البيانات
async function checkAndSaveUser(userId, userContact) {
    try {
        const userRef = doc(db, "leaderboard", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const savedLocalId = localStorage.getItem('prediction_user_id');
            if (savedLocalId !== userId) {
                alert("❌ This ID is already taken by another player! Please choose a unique name.");
                userIdInput.focus();
                return;
            }
        }

        localStorage.setItem('prediction_user_id', userId);
        localStorage.setItem('prediction_user_contact', userContact);
        
        userIdInput.disabled = true;
        
        // بمجرد الحفظ الناجح، نقوم بإخفاء خانة الاتصال بتأثير مرن وانسيابي
        if (contactContainer) {
            contactContainer.style.display = 'none';
        }
        
        saveIdBtn.textContent = "Identity Locked 🔒 (Change ID)";

        let currentPoints = 0;
        let creationTime = new Date().getTime();

        if (userSnap.exists()) {
            currentPoints = userSnap.data().totalPoints || 0;
            creationTime = userSnap.data().createdAt || creationTime; 
        }

        await setDoc(userRef, { 
            userId: userId, 
            contact: userContact, // يُحفظ في قاعدة البيانات في الخلفية
            totalPoints: currentPoints,
            createdAt: creationTime 
        }, { merge: true });

        alert("✅ Identity saved successfully! Your contact details are securely registered.");
        loadLeaderboard();

    } catch (e) {
        console.error(e);
        alert("❌ Error saving user data.");
    }
}

// 1. جلب المباريات مع تفقد القفل اليدوي من الآدمن (isLocked)
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="glass p-6 rounded-xl text-center text-slate-500">No matches available.</div>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const match = docSnap.data();
            const matchId = docSnap.id;
            
            // الاعتماد كلياً على زر القفل اليدوي من الآدمن (isLocked)
            const isLocked = match.isLocked === true;

            const homeLogo = match.homeLogo ? match.homeLogo.trim() : '';
            const awayLogo = match.awayLogo ? match.awayLogo.trim() : '';

            const card = document.createElement('div');
            card.className = "glass p-5 rounded-2xl space-y-4 shadow-xl border border-sky-500/20";
            card.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <div class="relative z-10 w-16 h-16 flex items-center justify-center">
                            <img src="${homeLogo}" 
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/53/53283.png';" 
                                 class="w-full h-full object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        </div>
                        <span class="font-bold text-sm text-white">${match.homeTeam}</span>
                    </div>

                    <div class="text-center w-1/3 space-y-1">
                        <span class="text-[10px] uppercase font-bold ${isLocked ? 'text-rose-400 bg-rose-950/80 border-rose-900/50' : 'text-sky-400 bg-sky-950/80 border-sky-900/50'} px-3 py-1 rounded-full border shadow">
                            ${isLocked ? '🔴 Closed (Locked)' : '🟢 Open for Prediction'}
                        </span>
                        <div class="text-xs text-slate-500 font-semibold">VS</div>
                    </div>

                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <div class="relative z-10 w-16 h-16 flex items-center justify-center">
                            <img src="${awayLogo}" 
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/53/53283.png';" 
                                 class="w-full h-full object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        </div>
                        <span class="font-bold text-sm text-white">${match.awayTeam}</span>
                    </div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = "flex gap-2 pt-2";
            const opts = [{l: 'Home Win', v: '1'}, {l: 'Draw', v: 'X'}, {l: 'Away Win', v: '2'}];

            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${isLocked ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed' : 'bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300'}`;
                btn.textContent = opt.l;
                
                // إذا كانت مغلقة يدوياً من الآدمن، نمنع الضغط نهائياً
                if (!isLocked) {
                    btn.onclick = () => submitPrediction(matchId, opt.v, btn);
                }
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
    const userContact = localStorage.getItem('prediction_user_contact');

    if (!userId || !userContact) { 
        alert("⚠️ Please save your ID and Contact info first!"); 
        userIdInput.focus(); 
        return; 
    }

    try {
        await setDoc(doc(db, "predictions", `${userId}_${matchId}`), {
            userId, matchId, prediction: choice, timestamp: new Date()
        });
        
        const userRef = doc(db, "leaderboard", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { userId, contact: userContact, totalPoints: 0, createdAt: new Date().getTime() });
        }

        btnElement.parentElement.querySelectorAll('button').forEach(b => b.classList.replace('bg-sky-600', 'bg-slate-900'));
        btnElement.classList.replace('bg-slate-900', 'bg-sky-600');
        
        alert(`✅ Prediction saved!`);
        loadLeaderboard();
    } catch (e) { alert("❌ Error saving prediction."); }
}

// 3. جلب الترتيب مع نظام كسر التعادل
async function loadLeaderboard() {
    const tableContainer = document.getElementById('leaderboardContainer');
    const myCardContainer = document.getElementById('myRankCard');
    const currentUserId = localStorage.getItem('prediction_user_id');

    try {
        const snap = await getDocs(collection(db, "leaderboard"));

        if (snap.empty) {
            tableContainer.innerHTML = `<p class="text-slate-500 text-center py-2 text-xs">No rankings yet.</p>`;
            if(myCardContainer) myCardContainer.innerHTML = `<span class="text-xs text-slate-400">Save your ID to see your rank.</span>`;
            return;
        }

        let players = [];
        snap.forEach(docSnap => {
            players.push(docSnap.data());
        });

        players.sort((a, b) => {
            const pointsA = a.totalPoints || 0;
            const pointsB = b.totalPoints || 0;

            if (pointsB !== pointsA) {
                return pointsB - pointsA; 
            } else {
                const timeA = a.createdAt || Date.now();
                const timeB = b.createdAt || Date.now();
                return timeA - timeB;
            }
        });

        let rank = 1;
        let myData = null;
        let myRank = 0;
        let tableHtml = `<table class="w-full text-left text-xs">`;

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
