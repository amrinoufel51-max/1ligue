import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, query, where, orderBy, limit, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        contactText: "If you have any questions, technical issues, or want to get in touch regarding prizes, you can reach us directly via our Instagram page below:",
        gotIt: "Got it",
        closeModal: "Close",
        subTitle: "Predict the matches, climb the global rank.",
        playerIdLabel: "Player Identity (Unique ID)",
        playerIdPlaceholder: "Enter your unique id...",
        contactLabel: "Contact (Phone or Email - For Prizes)",
        contactPlaceholder: "Enter WhatsApp number or Email...",
        upcomingMatches: "⚽ Upcoming Matches",
        rankingsTitle: "🏆 Rankings & Leaderboard",
        principalRank: "Principal Rank 🏆",
        monthlyRank: "Manager of the Month 🎖️",
        navMenuTitle: "⚡ Navigation Menu",
        navFooter: "Built for Football Predictors ⚽",
        whatsappLabel: "Official Instagram Page",
        pointsLabel: "pts",
        totalPlayersLabel: "Total Registered Players: "
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
        contactText: "إذا كانت لديك أي أسئلة أو مشاكل تقنية أو أردت الاستفسار عن الجوائز، يمكنك التواصل معنا مباشرة عبر صفحتنا على الإنستغرام:",
        gotIt: "حسناً",
        closeModal: "إغلاق",
        subTitle: "توقع المباريات وتصدر الترتيب العالمي.",
        playerIdLabel: "هوية اللاعب (المعرف الفريد)",
        playerIdPlaceholder: "أدخل المعرف الفريد الخاص بك...",
        contactLabel: "معلومات الاتصال (هاتف أو إيميل - للجوائز)",
        contactPlaceholder: "أدخل رقم الواتساب أو البريد الإلكتروني...",
        upcomingMatches: "⚽ المباريات القادمة",
        rankingsTitle: "🏆 التصنيفات لوحة المتصدرين",
        principalRank: "الترتيب الرئيسي 🏆",
        monthlyRank: "مدرب الشهر 🎖️",
        navMenuTitle: "⚡ قائمة التنقل",
        navFooter: "مبني لعشاق التوقعات ⚽",
        whatsappLabel: "الصفحة الرسمية على إنستغرام",
        pointsLabel: "نقاط",
        totalPlayersLabel: "إجمالي المشتركين المسجلين: "
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
    updateTextById('rankingsTitleText', `🏆 ${t.rankingsTitle}`);
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
    
    updateTotalPlayersCount();
}

window.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    const savedId = localStorage.getItem('prediction_user_id');

    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true;
        if (contactContainer) contactContainer.style.display = 'none';
        saveIdBtn.textContent = translations[currentLang].saveBtnLocked;
    }
    loadMatches();
    loadLeaderboard();
});

async function updateTotalPlayersCount() {
    const t = translations[currentLang];
    try {
        const collRef = collection(db, "leaderboard");
        const snapshot = await getCountFromServer(collRef);
        const total = snapshot.data().count;
        
        let counterEl = document.getElementById('totalPlayersCountText');
        if (!counterEl) {
            const rankingsHeader = document.getElementById('rankingsTitleText');
            if (rankingsHeader && rankingsHeader.parentElement) {
                counterEl = document.createElement('div');
                counterEl.id = 'totalPlayersCountText';
                counterEl.className = "text-xs text-sky-400 font-semibold mb-2";
                rankingsHeader.parentElement.insertBefore(counterEl, rankingsHeader.nextSibling);
            }
        }
        if (counterEl) {
            counterEl.innerHTML = `👥 ${t.totalPlayersLabel}<span class="text-white font-bold">${total}</span>`;
        }
    } catch (e) {
        console.error("Error getting total players count:", e);
    }
}

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

        if (!userId) { alert(t.alertNoId); userIdInput.focus(); return; }
        if (!userContact) { alert(t.alertNoContact); userContactInput.focus(); return; }

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
        if (contactContainer) contactContainer.style.display = 'none';
        saveIdBtn.textContent = t.saveBtnLocked;

        let currentPoints = userSnap.exists() ? (userSnap.data().totalPoints || 0) : 0;
        let currentMonthlyPoints = userSnap.exists() ? (userSnap.data().monthlyPoints || 0) : 0;
        let creationTime = userSnap.exists() ? (userSnap.data().createdAt || Date.now()) : Date.now();

        await setDoc(userRef, { 
            userId, contact: userContact, totalPoints: currentPoints, monthlyPoints: currentMonthlyPoints, createdAt: creationTime 
        }, { merge: true });

        alert(t.alertSuccessId);
        loadLeaderboard();
        updateTotalPlayersCount();
    } catch (e) {
        console.error("Error saving user:", e);
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
            const qPreds = query(
                collection(db, "predictions"),
                where("userId", "==", currentUserId)
            );
            const predSnap = await getDocs(qPreds);
            predSnap.forEach(docSnap => {
                const data = docSnap.data();
                userPredictions[data.matchId] = data.prediction;
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
                            <img src="${homeLogo}" referrerpolicy="no-referrer" onerror="this.src='https://cdn-icons-png.flaticon.com/512/53/53283.png';" class="w-full h-full object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        </div>
                        <span class="font-bold text-sm text-white">${homeTeamName}</span>
                    </div>
                    <div class="text-center w-1/3 space-y-1">
                        <span class="text-[10px] uppercase font-bold ${isLocked ? 'text-rose-400 bg-rose-950/80 border-rose-900/50' : 'text-sky-400 bg-sky-950/80 border-sky-900/50'} px-3 py-1 rounded-full border shadow">
                            ${isLocked ? (currentLang === 'ar' ? '🔴 مغلقة' : '🔴 Closed') : (currentLang === 'ar' ? '🟢 مفتوحة' : '🟢 Open')}
                        </span>
                        <div class="text-xs text-slate-500 font-semibold">VS</div>
                    </div>
                    <div class="flex flex-col items-center gap-2 w-1/3 text-center">
                        <div class="relative z-10 w-16 h-16 flex items-center justify-center">
                            <img src="${awayLogo}" referrerpolicy="no-referrer" onerror="this.src='https://cdn-icons-png.flaticon.com/512/53/53283.png';" class="w-full h-full object-contain bg-slate-950/80 p-2 rounded-2xl border border-slate-700 shadow-md">
                        </div>
                        <span class="font-bold text-sm text-white">${awayTeamName}</span>
                    </div>
                </div>
            `;

            const actions = document.createElement('div');
            actions.className = "flex gap-2 pt-2";
            
            const homeLabel = match.homeTeamWin || `${homeTeamName} Win`;
            const awayLabel = match.awayTeamWin || `${awayTeamName} Win`;
            const opts = [{ l: homeLabel, v: '1' }, { l: t.drawBtn, v: 'X' }, { l: awayLabel, v: '2' }];

            opts.forEach(opt => {
                const isSelected = userChoice === opt.v;
                const btn = document.createElement('button');
                
                let btnStyle = isSelected ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-500/30' : 'bg-slate-900/80 border-slate-700 hover:border-sky-400 hover:text-sky-300';
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
    } catch (e) { console.error("Error loading matches:", e); }
}

async function submitPrediction(matchId, choice, btnElement) {
    const userId = localStorage.getItem('prediction_user_id');
    const userContact = localStorage.getItem('prediction_user_contact');
    const t = translations[currentLang];

    if (!userId || !userContact) { alert(t.alertNoSave); userIdInput.focus(); return; }

    try {
        await setDoc(doc(db, "predictions", `${userId}_${matchId}`), {
            userId, matchId, prediction: choice, timestamp: new Date()
        });

        btnElement.parentElement.querySelectorAll('button').forEach(b => {
            b.className = "flex-1 py-2.5 rounded-xs text-[11px] font-bold border transition bg-slate-900/80 border-slate-700 text-white truncate px-1";
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
        
        // جلب أول 50 لاعباً يملكون أعلى نقاط في السيرفر باستخدام limit(50)
        const qTop = query(
            collection(db, "leaderboard"), 
            orderBy(sortField, "desc"), 
            orderBy("createdAt", "asc"),
            limit(50)
        );
        
        const topSnap = await getDocs(qTop);

        updateTotalPlayersCount();

        if (topSnap.empty) {
            tableContainer.innerHTML = `<p class="text-slate-500 text-center py-2 text-xs">${t.noRankings}</p>`;
            if (myCardContainer) myCardContainer.innerHTML = "";
            return;
        }

        let tableHtml = `<div class="overflow-x-auto"><table class="w-full text-xs border-collapse">`;
        tableHtml += `<thead><tr class="border-b border-slate-800 text-slate-400 bg-slate-900/40">
            <th class="py-3 px-3 w-12 text-center">#</th>
            <th class="py-3 px-3 text-start">${currentLang === 'ar' ? 'اللاعب' : 'Player'}</th>
            <th class="py-3 px-3 text-end">${currentLang === 'ar' ? 'النقاط' : 'Points'}</th>
        </tr></thead><tbody>`;

        let rankIndex = 1;
        topSnap.forEach(docSnap => {
            const data = docSnap.data();
            const isMe = data.userId === currentUserId;
            const currentPts = currentRankType === 'global' ? (data.totalPoints || 0) : (data.monthlyPoints || 0);

            let rankBadgeClass = "text-slate-400 font-semibold";
            if (rankIndex === 1) rankBadgeClass = "text-amber-400 font-black text-sm";
            else if (rankIndex === 2) rankBadgeClass = "text-slate-200 font-bold";
            else if (rankIndex === 3) rankBadgeClass = "text-amber-600 font-bold";

            tableHtml += `
                <tr class="${isMe ? 'bg-sky-500/20 border-sky-400/50 font-bold text-sky-200 shadow-inner' : 'text-slate-300 hover:bg-slate-900/30'} border-b border-slate-800/40 transition">
                    <td class="py-3 px-3 text-center ${rankBadgeClass}">#${rankIndex}</td>
                    <td class="py-3 px-3 text-start truncate max-w-[140px] sm:max-w-[200px]">${data.userId} ${isMe ? '👑' : ''}</td>
                    <td class="py-3 px-3 text-end font-black text-cyan-400">${currentPts} <span class="text-[10px] text-slate-400 font-normal">${t.pointsLabel}</span></td>
                </tr>`;
            rankIndex++;
        });
        tableHtml += `</tbody></table></div>`;
        tableContainer.innerHTML = tableHtml;

        // حساب بطاقة اللاعب الحالي الدقيقة
        if (myCardContainer && currentUserId) {
            const userDocRef = doc(db, "leaderboard", currentUserId);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
                const myData = userSnap.data();
                const myPts = currentRankType === 'global' ? (myData.totalPoints || 0) : (myData.monthlyPoints || 0);
                
                const qBetter = query(
                    collection(db, "leaderboard"),
                    where(sortField, ">", myPts)
                );
                const betterSnap = await getCountFromServer(qBetter);
                const myExactRank = betterSnap.data().count + 1;

                const rankTitle = currentRankType === 'global' ? (currentLang === 'ar' ? 'الترتيب العام' : 'Principal Rank') : (currentLang === 'ar' ? 'ترتيب مدرب الشهر' : 'Manager of the Month Rank');

                myCardContainer.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="bg-sky-500 text-slate-950 font-black px-3 py-2 rounded-lg text-sm shadow">#${myExactRank}</div>
                        <div>
                            <div class="text-xs text-sky-300 font-semibold">${rankTitle}</div>
                            <div class="text-sm font-bold text-white">${myData.userId} 👑</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="text-[10px] uppercase text-slate-400 tracking-wider">${currentRankType === 'global' ? 'Total Points' : 'Monthly Points'}</div>
                        <div class="text-lg font-black text-cyan-400">${myPts} ${t.pointsLabel}</div>
                    </div>
                `;
            } else {
                myCardContainer.innerHTML = `<div class="text-xs text-amber-400 py-1">⚠️ ID (${currentUserId}) not found in database yet.</div>`;
            }
        }
    } catch (e) { console.error("Error loading leaderboard:", e); }
}
