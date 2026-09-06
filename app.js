import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, update, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://oneligue-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ترجمات النصوص حسب اللغة
const translations = {
    en: {
        menu: "☰ Menu",
        navTitle: "⚡ Navigation Menu",
        about: "ℹ️ About Us",
        privacy: "🔒 Privacy Policy",
        contact: "📞 Contact Us",
        navFooter: "Built for Football Predictors ⚽",
        aboutTitle: "ℹ️ About Us",
        aboutText: "<b>One Ligue</b> is an interactive platform custom-built for football enthusiasts to predict match results and win major prizes for the Top 3 season finishers, alongside our special <b>Manager of the Month</b> award to keep the competition fierce all year round!",
        privacyTitle: "🔒 Privacy Policy",
        privacyText: "We completely respect your privacy. The information we collect is strictly limited to your Unique ID and contact details, used solely to record your predictions and reach out to you if you win prizes. We never share your data with third parties.",
        contactTitle: "📞 Contact Us",
        contactText: "If you have any questions, technical issues, or want to get in touch regarding prizes, you can reach us directly via the number below:",
        whatsappLabel: "WhatsApp / Phone Number",
        close: "Close",
        gotIt: "Got it",
        subTitle: "Predict the matches, climb the global rank.",
        playerIdLabel: "Player Identity (Unique ID)",
        contactLabel: "Contact (Phone or Email - For Prizes)",
        saveBtn: "Save Identity 💾",
        matchesTitle: "⚽ Upcoming Matches",
        rankingsTitle: "🏆 Rankings & Leaderboard",
        openRank: "▼ Click to open",
        globalBtn: "Principal Rank 🏆",
        monthlyBtn: "Manager of the Month 🎖️",
        predictBtn: "Submit Prediction 🎯",
        points: "pts",
        noMatches: "No upcoming matches available right now.",
        savedSuccess: "Identity saved successfully!",
        fillIdError: "Please enter your Player Identity (ID) first.",
        predictionSaved: "Prediction saved successfully! 🚀",
        rankGlobalTitle: "Global Rank",
        rankMonthlyTitle: "Monthly Rank",
        yourRank: "Your Rank"
    },
    ar: {
        menu: "☰ القائمة",
        navTitle: "⚡ قائمة التنقل",
        about: "ℹ️ من نحن",
        privacy: "🔒 سياسة الخصوصية",
        contact: "📞 اتصل بنا",
        navFooter: "مخصص لعشاق توقعات كرة القدم ⚽",
        aboutTitle: "ℹ️ من نحن",
        aboutText: "<b>One Ligue</b> هي منصة تفاعلية مخصصة لعشاق كرة القدم لتوقع نتائج المباريات والفوز بجوائز كبرى لأصحاب المراكز الثلاثة الأولى في الترتيب العام، بالإضافة إلى جائزة <b>مدرب الشهر</b> لإبقاء المنافسة مشتعلة طوال الموسم!",
        privacyTitle: "🔒 سياسة الخصوصية",
        privacyText: "نحن نحترم خصوصيتك تماماً. البيانات التي نجمعها تقتصر على المعرف الفريد (ID) ومعلومات الاتصال الخاصة بك، وتُستخدم حصرياً لتسجيل توقعاتك والتواصل معك في حال فوزك بالجوائز. لا نشارك بياناتك أبداً مع أي طرف ثالث.",
        contactTitle: "📞 اتصل بنا",
        contactText: "إذا كان لديك أي استفسار، مشكلة تقنية، أو ترغب في التواصل بخصوص الجوائز، يمكنك مراسلتنا مباشرة عبر الرقم أدناه:",
        whatsappLabel: "رقم الواتساب / الهاتف",
        close: "إغلاق",
        gotIt: "فهمت",
        subTitle: "توقع المباريات وتصدر الترتيب العالمي.",
        playerIdLabel: "معرف اللاعب (Unique ID)",
        contactLabel: "معلومات الاتصال (هاتف أو إيميل - للجوائز)",
        saveBtn: "حفظ الهوية 💾",
        matchesTitle: "⚽ المباريات القادمة",
        rankingsTitle: "🏆 الترتيب ولوحة الصدارة",
        openRank: "▼ اضغط للفتح",
        globalBtn: "الترتيب العام 🏆",
        monthlyBtn: "مدرب الشهر 🎖️",
        predictBtn: "إرسال التوقع 🎯",
        points: "نقاط",
        noMatches: "لا توجد مباريات قادمة حالياً.",
        savedSuccess: "تم حفظ الهوية بنجاح!",
        fillIdError: "الرجاء إدخال معرف اللاعب (ID) أولاً.",
        predictionSaved: "تم حفظ توقعك بنجاح! 🚀",
        rankGlobalTitle: "الترتيب العام",
        rankMonthlyTitle: "ترتيب الشهر",
        yourRank: "ترتيبك"
    }
};

let currentLang = 'ar'; // البدء بالعربية

window.toggleLanguage = function() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    updateUIText();
    loadMatches();
    loadLeaderboard();
};

function updateUIText() {
    const t = translations[currentLang];
    
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    // زر اللغة بدون أعلام (الكلمات فقط)
    document.getElementById('langToggleBtn').innerText = currentLang === 'ar' ? 'English' : 'العربية';
    
    document.getElementById('menuText').innerHTML = `<span>☰</span> ${currentLang === 'ar' ? 'القائمة' : 'Menu'}`;
    document.getElementById('subTitleText').innerText = t.subTitle;
    document.getElementById('navMenuTitleText').innerText = t.navTitle;
    document.getElementById('navAboutText').innerHTML = `<span>${t.about}</span> <span class="text-slate-500">›</span>`;
    document.getElementById('navPrivacyText').innerHTML = `<span>${t.privacy}</span> <span class="text-slate-500">›</span>`;
    document.getElementById('navContactText').innerHTML = `<span>${t.contact}</span> <span class="text-slate-500">›</span>`;
    document.getElementById('navFooterText').innerText = t.navFooter;

    document.getElementById('aboutModalTitle').innerText = t.aboutTitle;
    document.getElementById('aboutModalText').innerHTML = t.aboutText;
    document.getElementById('aboutModalBtn').innerText = t.gotIt;

    document.getElementById('privacyModalTitle').innerText = t.privacyTitle;
    document.getElementById('privacyModalText').innerHTML = t.privacyText;
    document.getElementById('privacyModalBtn').innerText = t.gotIt;

    document.getElementById('contactModalTitle').innerText = t.contactTitle;
    document.getElementById('contactModalText').innerText = t.contactText;
    document.getElementById('whatsappLabelText').innerText = t.whatsappLabel;
    document.getElementById('contactModalBtn').innerText = t.close;

    document.getElementById('playerIdLabelText').innerText = t.playerIdLabel;
    document.getElementById('contactLabelText').innerText = t.contactLabel;
    document.getElementById('saveIdBtn').innerText = t.saveBtn;
    document.getElementById('upcomingMatchesTitle').innerText = t.matchesTitle;
    document.getElementById('rankingsTitleText').innerHTML = `<span>${t.rankingsTitle}</span> <span class="text-xs text-slate-400 group-open:rotate-180 transition">${t.openRank}</span>`;
    document.getElementById('globalRankBtn').innerText = t.globalBtn;
    document.getElementById('monthlyRankBtn').innerText = t.monthlyBtn;
}

document.addEventListener("DOMContentLoaded", () => {
    updateUIText();
    loadMatches();
    loadLeaderboard();
});

document.getElementById('saveIdBtn').addEventListener('click', async () => {
    const userId = document.getElementById('currentUserId').value.trim();
    const contact = document.getElementById('userContact').value.trim();
    const t = translations[currentLang];

    if (!userId) {
        alert(t.fillIdError);
        return;
    }

    localStorage.setItem('oneligue_user', userId);
    if (contact) {
        localStorage.setItem('oneligue_contact', contact);
    }

    const userRef = ref(db, 'users/' + userId);
    await update(userRef, {
        userId: userId,
        contact: contact || localStorage.getItem('oneligue_contact') || '',
        lastActive: Date.now()
    });

    alert(t.savedSuccess);
    loadLeaderboard();
});

window.addEventListener('load', () => {
    const savedId = localStorage.getItem('oneligue_user');
    const savedContact = localStorage.getItem('oneligue_contact');
    if (savedId) document.getElementById('currentUserId').value = savedId;
    if (savedContact) document.getElementById('userContact').value = savedContact;
});

async function loadMatches() {
    const matchesContainer = document.getElementById('matchesContainer');
    const t = translations[currentLang];
    
    try {
        const snapshot = await get(child(ref(db), 'matches'));
        if (!snapshot.exists()) {
            matchesContainer.innerHTML = `<div class="glass p-6 rounded-2xl text-center text-slate-400 text-sm">${t.noMatches}</div>`;
            return;
        }

        const matches = snapshot.val();
        let html = '';

        for (const matchId in matches) {
            const m = matches[matchId];
            if (m.status === 'finished') continue;

            html += `
                <div class="glass p-4 rounded-2xl shadow-xl border border-slate-800/80 space-y-3">
                    <div class="text-center text-[11px] text-sky-400 font-bold tracking-wider uppercase">${m.league || 'One Ligue Match'}</div>
                    
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex-1 flex flex-col sm:flex-row items-center gap-2 text-center sm:text-start">
                            <img src="${m.homeFlag}" alt="${m.homeTeam}" class="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0">
                            <span class="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-none">${m.homeTeam}</span>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0">
                            <input type="number" id="home_${matchId}" min="0" max="20" class="w-11 h-11 text-center bg-slate-950/80 border border-slate-700/80 rounded-xl font-black text-lg text-sky-400 focus:border-sky-400 outline-none" placeholder="0">
                            <span class="text-slate-500 font-bold">:</span>
                            <input type="number" id="away_${matchId}" min="0" max="20" class="w-11 h-11 text-center bg-slate-950/80 border border-slate-700/80 rounded-xl font-black text-lg text-sky-400 focus:border-sky-400 outline-none" placeholder="0">
                        </div>

                        <div class="flex-1 flex flex-col sm:flex-row-reverse items-center gap-2 text-center sm:text-end">
                            <img src="${m.awayFlag}" alt="${m.awayTeam}" class="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0">
                            <span class="font-bold text-xs sm:text-sm text-white truncate max-w-[110px] sm:max-w-none">${m.awayTeam}</span>
                        </div>
                    </div>

                    <button onclick="submitPrediction('${matchId}')" class="w-full bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 py-2.5 rounded-xl font-bold text-xs transition shadow-md">
                        ${t.predictBtn}
                    </button>
                </div>
            `;
        }

        matchesContainer.innerHTML = html || `<div class="glass p-6 rounded-2xl text-center text-slate-400 text-sm">${t.noMatches}</div>`;

        const userId = localStorage.getItem('oneligue_user');
        if (userId) {
            for (const matchId in matches) {
                const predSnap = await get(child(ref(db), `predictions/${matchId}/${userId}`));
                if (predSnap.exists()) {
                    const pData = predSnap.val();
                    const hInput = document.getElementById(`home_${matchId}`);
                    const aInput = document.getElementById(`away_${matchId}`);
                    if (hInput && aInput) {
                        hInput.value = pData.homeScore;
                        aInput.value = pData.awayScore;
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
    }
}

window.submitPrediction = async function(matchId) {
    const userId = document.getElementById('currentUserId').value.trim();
    const contact = document.getElementById('userContact').value.trim();
    const t = translations[currentLang];

    if (!userId) {
        alert(t.fillIdError);
        document.getElementById('currentUserId').focus();
        return;
    }

    const homeScore = document.getElementById(`home_${matchId}`).value;
    const awayScore = document.getElementById(`away_${matchId}`).value;

    if (homeScore === '' || awayScore === '') {
        alert(currentLang === 'ar' ? 'الرجاء إدخال نتيجة التوقع للفريقين' : 'Please enter scores for both teams.');
        return;
    }

    if (contact) {
        localStorage.setItem('oneligue_contact', contact);
    }

    const predRef = ref(db, `predictions/${matchId}/${userId}`);
    await set(predRef, {
        userId: userId,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        timestamp: Date.now()
    });

    await update(ref(db, `users/${userId}`), {
        userId: userId,
        contact: contact || localStorage.getItem('oneligue_contact') || ''
    });

    alert(t.predictionSaved);
};

let currentRankType = 'global';

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
}

async function loadLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    const myRankCard = document.getElementById('myRankCard');
    const userId = localStorage.getItem('oneligue_user');
    const t = translations[currentLang];

    try {
        const usersSnap = await get(child(ref(db), 'users'));
        if (!usersSnap.exists()) {
            leaderboardContainer.innerHTML = `<div class="p-4 text-center text-slate-500 text-xs">No users ranked yet.</div>`;
            myRankCard.innerHTML = `<span class="text-xs text-slate-400">${t.yourRank}: --</span>`;
            return;
        }

        let usersList = [];
        usersSnap.forEach(childSnap => {
            const u = childSnap.val();
            let pts = currentRankType === 'global' ? (u.totalPoints || 0) : (u.monthlyPoints || 0);
            usersList.push({
                userId: u.userId,
                points: pts
            });
        });

        usersList.sort((a, b) => b.points - a.points);

        let html = '<div class="space-y-2">';
        let userRankIndex = -1;

        usersList.forEach((u, index) => {
            const rank = index + 1;
            if (userId && u.userId === userId) {
                userRankIndex = rank;
            }

            let medalColor = "text-slate-400";
            if (rank === 1) medalColor = "text-amber-400 font-black text-base";
            else if (rank === 2) medalColor = "text-slate-300 font-bold";
            else if (rank === 3) medalColor = "text-amber-600 font-bold";

            html += `
                <div class="bg-slate-950/50 border border-slate-800/80 px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                    <div class="flex items-center gap-3">
                        <span class="w-6 text-center ${medalColor}">#${rank}</span>
                        <span class="font-bold text-white truncate max-w-[130px] sm:max-w-[200px]">${u.userId}</span>
                    </div>
                    <div class="font-black text-sky-400 shrink-0">
                        ${u.points} <span class="text-[11px] text-slate-400 font-normal">${t.points}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        leaderboardContainer.innerHTML = html;

        if (userId && userRankIndex !== -1) {
            myRankCard.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="bg-sky-500 text-slate-950 font-black px-2 py-1 rounded-lg text-xs">#${userRankIndex}</span>
                    <span class="font-bold text-xs sm:text-sm text-white truncate max-w-[140px]">${userId}</span>
                </div>
                <div class="${currentLang === 'ar' ? 'text-left' : 'text-right'}">
                    <span class="text-xs text-sky-300 block">${t.yourRank}</span>
                    <span class="font-black text-sky-400 text-sm">${usersList[userRankIndex - 1].points} <span class="text-[11px] font-normal text-slate-300">${t.points}</span></span>
                </div>
            `;
        } else {
            myRankCard.innerHTML = `
                <span class="text-xs text-slate-300">${t.yourRank}: --</span>
                <span class="text-xs text-sky-300">Enter your ID above</span>
            `;
        }

    } catch (e) {
        console.error(e);
    }
}
