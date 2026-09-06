import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

let currentRankType = 'global';

const translations = {
    en: {
        saveBtnLocked: "Identity Locked 🔒 (Change ID)",
        saveBtnUnlock: "Save Identity 💾",
        alertNoId: "⚠️ Please enter your unique ID!",
        alertNoContact: "⚠️ Please enter your phone number or email so we can contact you if you win!",
        alertTakenId: "❌ This ID is already taken by another player! Please choose a unique name.",
        alertSuccessId: "✅ Identity saved successfully! Your contact details are securely registered.",
        alertErrorId: "❌ Error saving user data.",
        alertNoSave: "⚠️ Please save your ID and Contact info first!",
        alertSuccessPred: "✅ Prediction saved!",
        alertErrorPred: "❌ Error saving prediction.",
        noMatches: "No matches available.",
        noRankings: "No rankings yet.",
        drawBtn: "Draw 🤝",
        menu: "Menu",
        about: "ℹ️ About Us",
        privacy: "🔒 Privacy Policy",
        contact: "📞 Contact Us",
        aboutTitle: "ℹ️ About Us",
        privacyTitle: "🔒 Privacy Policy",
        contactTitle: "📞 Contact Us",
        aboutText: "<b>One Ligue</b> is an interactive platform custom-built for football enthusiasts to predict match results and win major prizes for the Top 3 season finishers, alongside our special <b>Manager of the Month</b> award to keep the competition fierce all year round!",
        privacyText: "We completely respect your privacy. The information we collect is strictly limited to your Unique ID and contact details, used solely to record your predictions and reach out to you if you win prizes. We never share your data with third parties.",
        contactText: "If you have any questions, technical issues, or want to get in touch regarding prizes, you can reach us directly via the number below:",
        gotIt: "Got it",
        closeModal: "Close",
        subTitle: "Predict the matches, climb the global rank.",
        playerIdLabel: "Player Identity (Unique ID)",
        playerIdPlaceholder: "Enter your unique id...",
        contactLabel: "Contact (Phone or Email - For Prizes)",
        contactPlaceholder: "Enter WhatsApp number or Email...",
        upcomingMatches: "⚽ Upcoming Matches",
        rankingsTitle: "🏆 Rankings & Leaderboard",
        rankingsToggle: "▼ Click to open",
        principalRank: "Principal Rank 🏆",
        monthlyRank: "Manager of the Month 🎖️",
        navMenuTitle: "⚡ Navigation Menu",
        navFooter: "Built for Football Predictors ⚽",
        whatsappLabel: "WhatsApp / Phone Number"
    },
    ar: {
        saveBtnLocked: "تم قفل الهوية 🔒 (تغيير المعرف)",
        saveBtnUnlock: "حفظ الهوية 💾",
        alertNoId: "⚠️ يرجى إدخال معرف فريد خاص بك!",
        alertNoContact: "⚠️ يرجى إدخال رقم هاتفك أو بريدك الإلكتروني لنتواصل معك إذا فزت!",
        alertTakenId: "❌ هذا المعرف محجوز من طرف لاعب آخر! يرجى اختيار اسم فريد.",
        alertSuccessId: "✅ تم حفظ الهوية بنجاح! معلومات الاتصال مسجلة بأمان.",
        alertErrorId: "❌ خطأ في حفظ بيانات المستخدم.",
        alertNoSave: "⚠️ يرجى حفظ المعرف ومعلومات الاتصال أولاً!",
        alertSuccessPred: "✅ تم حفظ التوقع!",
        alertErrorPred: "❌ خطأ في حفظ التوقع.",
        noMatches: "لا توجد مباريات متاحة حالياً.",
        noRankings: "لا توجد ترتيبات حتى الآن.",
        drawBtn: "تعادل 🤝",
        menu: "القائمة",
        about: "ℹ️ من نحن",
        privacy: "🔒 سياسة الخصوصية",
        contact: "📞 اتصل بنا",
        aboutTitle: "ℹ️ من نحن",
        privacyTitle: "🔒 سياسة الخصوصية",
        contactTitle: "📞 اتصل بنا",
        aboutText: "<b>One Ligue</b> هي منصة تفاعلية مخصصة لعشاق كرة القدم لتوقع نتائج المباريات والفوز بجوائز كبرى لصاحب المراكز الثلاثة الأولى في الموسم، إلى جانب جائزة <b>مدرب الشهر</b> الخاصة!",
        privacyText: "نحن نحترم خصوصيتك تماماً. البيانات التي نجمعها تقتصر على المعرف الفريد ومعلومات الاتصال لتسجيل توقعاتك والتواصل معك حال فوزك بالجوائز. لا نشارك بياناتك أبداً مع أطراف ثالثة.",
        contactText: "إذا كانت لديك أي أسئلة أو مشاكل تقنية أو أردت الاستفسار عن الجوائز، يمكنك التواصل معنا مباشرة عبر الرقم أدناه:",
        gotIt: "حسناً",
        closeModal: "إغلاق",
        subTitle: "توقع المباريات وتصدر الترتيب العالمي.",
        playerIdLabel: "هوية اللاعب (المعرف الفريد)",
        playerIdPlaceholder: "أدخل المعرف الفريد الخاص بك...",
        contactLabel: "معلومات الاتصال (هاتف أو إيميل - للجوائز)",
        contactPlaceholder: "أدخل رقم الواتساب أو البريد الإلكتروني...",
        upcomingMatches: "⚽ المباريات القادمة",
        rankingsTitle: "🏆 التصنيفات لوحة المتصدرين",
        rankingsToggle: "▼ اضغط للفتح",
        principalRank: "الترتيب الرئيسي 🏆",
        monthlyRank: "مدرب الشهر 🎖️",
        navMenuTitle: "⚡ قائمة التنقل",
        navFooter: "مبني لعشاق التوقعات ⚽",
        whatsappLabel: "رقم الواتساب / الهاتف"
    }
};

let currentLang = localStorage.getItem("app_lang") || "en";

window.toggleLanguage = function() {
    currentLang = currentLang === "en" ? "ar" : "en";
    localStorage.setItem("app_lang", currentLang);
    applyLanguage();
    loadMatches();
    loadLeaderboard();
};

function applyLanguage() {
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;

    const t = translations[currentLang];

    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
        langBtn.innerText = currentLang === "en" ? "العربية 🇩🇿" : "English 🇬🇧";
    }

    const savedId = localStorage.getItem('prediction_user_id');
    if (saveIdBtn) {
        saveIdBtn.textContent = savedId ? t.saveBtnLocked : t.saveBtnUnlock;
    }

    if (userIdInput) userIdInput.placeholder = t.playerIdPlaceholder;
    if (userContactInput) userContactInput.placeholder = t.contactPlaceholder;

    const updateTextById = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = text;
    };

    updateTextById('menuText', `<span>☰</span> ${t.menu}`);
    updateTextById('subTitleText', t.subTitle);
    updateTextById('playerIdLabelText', t.playerIdLabel);
    updateTextById('contactLabelText', t.contactLabel);
    updateTextById('upcomingMatchesTitle', t.upcomingMatches);
    updateTextById('rankingsTitleText', t.rankingsToggle ? `<span>🏆 ${t.rankingsTitle}</span><span class="text-xs text-slate-400 group-open:rotate-180 transition">${t.rankingsToggle}</span>` : '');
    updateTextById('globalRankBtn', t.principalRank);
    updateTextById('monthlyRankBtn', t.monthlyRank);
    updateTextById('navMenuTitleText', `⚡ ${t.navMenuTitle}`);
    updateTextById('navAboutText', `<span>${t.about}</span><span class="text-slate-500">›</span>`);
    updateTextById('navPrivacyText', `<span>${t.privacy}</span><span class="text-slate-500">›</span>`);
    updateTextById('navContactText', `<span>${t.contact}</span><span class="text-slate-500">›</span>`);
    updateTextById('navFooterText', t.navFooter);

    updateTextById('aboutModalTitle', t.aboutTitle);
    updateTextById('aboutModalText', t.aboutText);
    updateTextById('aboutModalBtn', t.gotIt);

    updateTextById('privacyModalTitle', t.privacyTitle);
    updateTextById('privacyModalText', t.privacyText);
    updateTextById('privacyModalBtn', t.gotIt);

    updateTextById('contactModalTitle', t.contactTitle);
    updateTextById('contactModalText', t.contactText);
    updateTextById('whatsappLabelText', t.whatsappLabel);
    updateTextById('contactModalBtn', t.closeModal);
}

window.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    const savedId = localStorage.getItem('prediction_user_id');
    const savedContact = localStorage.getItem('prediction_user_contact');

    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true;
        
        if (contactContainer) {
            contactContainer.style.display = 'none';
        }

        saveIdBtn.textContent = translations[currentLang].saveBtnLocked;
    }
    loadMatches();
    loadLeaderboard();
});

window.showRank = function(type) {
    currentRankType = type;
    const globalBtn = document.getElementById('globalRankBtn');
    const monthlyBtn = document.getElementById('monthlyRankBtn');

    if (type === 'global') {
        globalBtn.className = "flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow transition";
        monthlyBtn.className = "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs shadow transition";
    } else {
        monthlyBtn.className = "flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow transition";
        globalBtn.className = "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs shadow transition";
    }

    loadLeaderboard();
};

saveIdBtn.addEventListener('click', () => {
    const t = translations[currentLang];
    if (userIdInput.disabled) {
        userIdInput.disabled = false;
        userIdInput.focus();
        saveIdBtn.textContent = t.saveBtnUnlock;
        localStorage.removeItem('prediction_user_id');
    } else {
        const userId = userIdInput.value.trim();
        const userContact = userContactInput.value.trim();

        if (!userId) {
            alert(t.alertNoId);
            userIdInput.focus();
            return;
        }
        if (!userContact) {
            alert(t.alertNoContact);
            userContactInput.focus();
            return;
        }

        checkAndSaveUser(userId, userContact);
    }
});

async function checkAndSaveUser(userId, userContact) {
    const t = translations[currentLang];
    try {
        const userRef = doc(db, "leaderboard", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const savedLocalId = localStorage.getItem('prediction_user_id');
            if (savedLocalId !== userId) {
                alert(t.alertTakenId);
                userIdInput.focus();
                return;
            }
        }

        localStorage.setItem('prediction_user_id', userId);
        localStorage.setItem('prediction_user_contact', userContact);
        
        userIdInput.disabled = true;
        
        if (contactContainer) {
            contactContainer.style.display = 'none';
        }
        
        saveIdBtn.textContent = t.saveBtnLocked;

        let currentPoints = 0;
        let currentMonthlyPoints = 0;
        let creationTime = new Date().getTime();

        if (userSnap.exists()) {
            currentPoints = userSnap.data().totalPoints || 0;
            currentMonthlyPoints = userSnap.data().monthlyPoints || 0;
            creationTime = userSnap.data().createdAt || creationTime; 
        }

        await setDoc(userRef, { 
            userId: userId, 
            contact: userContact,
            totalPoints: currentPoints,
            monthlyPoints: currentMonthlyPoints,
            createdAt: creationTime 
        }, { merge: true });

        alert(t.alertSuccessId);
        loadLeaderboard();

    } catch (e) {
        console.error(e);
        alert(t.alertErrorId);
    }
}

async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    const currentUserId = localStorage.getItem('prediction_user_id');
    const t = translations[currentLang];

    try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        
        let userPredictions = {};
        if (currentUserId) {
            const predSnap = await getDocs(collection(db, "predictions"));
            predSnap.forEach(docSnap => {
                const data = docSnap.data();
                if (data.userId === currentUserId) {
                    userPredictions[data.matchId] = data.prediction;
                }
            });
        }

        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="glass p-6 rounded-xl text-center text-slate-500">${t.noMatches}</div>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const match = docSnap.data();
            const matchId = docSnap.id;
            
            const isLocked = match.isLocked === true;
            const userChoice = userPredictions[matchId] || null;

            const homeLogo = match.homeLogo ? match.homeLogo.trim() : '';
            const awayLogo = match.awayLogo ? match.awayLogo.trim() : '';
            
            const homeTeamName = match.homeTeam || "Home";
            const awayTeamName = match.awayTeam || "Away";

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
                        <span class="font-bold text-sm text-white">${homeTeamName}</span>
                    </div>

                    <div class="text-center w-1/3 space-y-1">
                        <span class="text-[10px] uppercase font-bold ${isLocked ? 'text-rose-400 bg-rose-950/80 border-rose-900/50' : 'text-sky-400 bg-sky-950/80 border-sky-900/50'} px-3 py-1 rounded-full border shadow">
                            ${isLocked ? (currentLang === 'ar' ? '🔴 مغلقة (مقفلة)' : '🔴 Closed (Locked)') : (currentLang === 'ar' ? '🟢 مفتوحة للتوقع' : '🟢 Open for Prediction')}
                        </span>
                        <div class="text-xs text-slate-500 font-semibold">VS</div>
                    </div>

                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <div class="relative z-10 w-16 h-16 flex items-center justify-center">
                            <img src="${awayLogo}" 
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/53/53283.png';" 
                                 class="w-full h-full object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        </div>
                        <span class="font-bold text-sm text-white">${awayTeamName}</span>
                    </div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = "flex gap-2 pt-2";
            
            const homeLabelCustom = match.homeTeamWin && match.homeTeamWin.trim() !== "" ? match.homeTeamWin : `${homeTeamName} Win`;
            const awayLabelCustom = match.awayTeamWin && match.awayTeamWin.trim() !== "" ? match.awayTeamWin : `${awayTeamName} Win`;

            const opts = [
                { l: homeLabelCustom, v: '1' }, 
                { l: t.drawBtn, v: 'X' }, 
                { l: awayLabelCustom, v: '2' }
            ];

            opts.forEach(opt => {
                const isSelected = userChoice === opt.v;
                const btn = document.createElement('button');
                
                let btnStyle = 'bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300';
                if (isSelected) {
                    btnStyle = 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/30';
                }
                if (isLocked) {
                    btnStyle = isSelected ? 'bg-sky-700/60 text-white border-sky-600 cursor-not-allowed' : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed';
                }

                btn.className = `flex-1 py-2.5 rounded-xs text-[11px] font-bold border transition truncate px-1 ${btnStyle}`;
                btn.textContent = opt.l;
                
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

async function submitPrediction(matchId, choice, btnElement) {
    const userId = localStorage.getItem('prediction_user_id');
    const userContact = localStorage.getItem('prediction_user_contact');
    const t = translations[currentLang];

    if (!userId || !userContact) { 
        alert(t.alertNoSave); 
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
            await setDoc(userRef, { userId, contact: userContact, totalPoints: 0, monthlyPoints: 0, createdAt: new Date().getTime() });
        }

        btnElement.parentElement.querySelectorAll('button').forEach(b => {
            b.className = "flex-1 py-2.5 rounded-xs text-[11px] font-bold border transition bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300 text-white truncate px-1";
        });
        btnElement.className = "flex-1 py-2.5 rounded-xs text-[11px] font-bold border transition bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/30 truncate px-1";
        
        alert(t.alertSuccessPred);
        loadLeaderboard();
    } catch (e) { alert(t.alertErrorPred); }
}

async function loadLeaderboard() {
    const tableContainer = document.getElementById('leaderboardContainer');
    const myCardContainer = document.getElementById('myRankCard');
    const currentUserId = localStorage.getItem('prediction_user_id');
    const t = translations[currentLang];

    try {
        const sortField = currentRankType === 'global' ? 'totalPoints' : 'monthlyPoints';
        const q = query(collection(db, "leaderboard"), orderBy(sortField, "desc"), limit(50));
        const snap = await getDocs(q);

        let myData = null;
        let myRank = "-";
        
        if (currentUserId) {
            const allSnap = await getDocs(collection(db, "leaderboard"));
            let allPlayers = [];
            allSnap.forEach(d => allPlayers.push(d.data()));

            allPlayers.sort((a, b) => {
                const pA = currentRankType === 'global' ? (a.totalPoints || 0) : (a.monthlyPoints || 0);
                const pB = currentRankType === 'global' ? (b.totalPoints || 0) : (b.monthlyPoints || 0);
                if (pB !== pA) return pB - pA;
                return (a.createdAt || Date.now()) - (b.createdAt || Date.now());
            });

            let globalIndex = 1;
            for (let player of allPlayers) {
                if (player.userId === currentUserId) {
                    myData = player;
                    myRank = globalIndex;
                    break;
                }
                globalIndex++;
            }
        }

        if (snap.empty) {
            tableContainer.innerHTML = `<p class="text-slate-500 text-center py-2 text-xs">${t.noRankings}</p>`;
        } else {
            let players = [];
            snap.forEach(docSnap => players.push(docSnap.data()));

            players.sort((a, b) => {
                const pointsA = currentRankType === 'global' ? (a.totalPoints || 0) : (a.monthlyPoints || 0);
                const pointsB = currentRankType === 'global' ? (b.totalPoints || 0) : (b.monthlyPoints || 0);
                if (pointsB !== pointsA) return pointsB - pointsA; 
                return (a.createdAt || Date.now()) - (b.createdAt || Date.now());
            });

            let rank = 1;
            let tableHtml = `<table class="w-full text-left text-xs">`;

            players.forEach(data => {
                const isMe = data.userId === currentUserId;
                const currentPts = currentRankType === 'global' ? (data.totalPoints || 0) : (data.monthlyPoints || 0);

                tableHtml += `
                    <tr class="${isMe ? 'bg-sky-500/20 border-l-2 border-sky-400 font-bold text-sky-300' : 'text-slate-300'} border-b border-slate-800/60">
                        <td class="py-2.5 px-2">#${rank}</td>
                        <td class="py-2.5 px-2">${data.userId} ${isMe ? '👑' : ''}</td>
                        <td class="py-2.5 px-2 text-right text-cyan-400">${currentPts} pts</td>
                    </tr>`;
                rank++;
            });
            tableHtml += `</table>`;
            tableContainer.innerHTML = tableHtml;
        }

        if (myCardContainer) {
            if (currentUserId) {
                if (myData) {
                    const myPts = currentRankType === 'global' ? (myData.totalPoints || 0) : (myData.monthlyPoints || 0);
                    const rankTitle = currentRankType === 'global' ? (currentLang === 'ar' ? 'الترتيب العام' : 'Principal Rank') : (currentLang === 'ar' ? 'ترتيب مدرب الشهر' : 'Manager of the Month Rank');

                    myCardContainer.innerHTML = `
                        <div class="flex items-center gap-3">
                            <div class="bg-sky-500 text-slate-950 font-black px-3 py-2 rounded-lg text-sm shadow">
                                #${myRank}
                            </div>
                            <div>
                                <div class="text-xs text-sky-300 font-semibold">${rankTitle}</div>
                                <div class="text-sm font-bold text-white">${myData.userId} 👑</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] uppercase text-slate-400 tracking-wider">${currentRankType === 'global' ? (currentLang === 'ar' ? 'المجموع' : 'Total Points') : (currentLang === 'ar' ? 'نقاط الشهر' : 'Monthly Points')}</div>
                            <div class="text-lg font-black text-cyan-400">${myPts} pts</div>
                        </div>
                    `;
                } else {
                    myCardContainer.innerHTML = `
                        <div class="text-xs text-amber-400 py-1">
                            ⚠️ ${currentLang === 'ar' ? `المعرف (${currentUserId}) غير موجود في الترتيب بعد. توقع الآن!` : `ID (${currentUserId}) not found in rankings yet. Make a prediction!`}
                        </div>
                    `;
                }
            } else {
                myCardContainer.innerHTML = `
                    <div class="text-xs text-slate-400 py-1">
                        🔍 ${currentLang === 'ar' ? 'أدخل واحفظ معرفك أعلاه لتتبع ترتيبك الشخصي.' : 'Enter and save your ID above to track your personal rank.'}
                    </div>
                `;
            }
        }

    } catch (e) { 
        console.error(e); 
    }
}
