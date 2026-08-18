// استيراد Firebase SDK من السيرفر الرسمي
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, setDoc, doc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات مشروعك الحقيقية في Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBmh4fqvWpGLietTIESEyd6BkTCtMnMquw",
    authDomain: "league-91565.firebaseapp.com",
    projectId: "league-91565",
    storageBucket: "league-91565.firebasestorage.app",
    messagingSenderId: "923003244062",
    appId: "1:923003244062:web:a2bf91b86de0d1bf73a80f"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// عناصر واجهة إدخال وحفظ الـ ID
const userIdInput = document.getElementById('currentUserId');
const saveIdBtn = document.getElementById('saveIdBtn');

// عند فتح الصفحة، تحقق إذا كان الـ ID مخزن مسبقاً في المتصفح
window.addEventListener('DOMContentLoaded', () => {
    const savedId = localStorage.getItem('prediction_user_id');
    if (savedId) {
        userIdInput.value = savedId;
        userIdInput.disabled = true; // قفل الحقل لمنع تعديله بالخطأ
        saveIdBtn.textContent = "تغيير 🔄";
    }
});

// زر حفظ أو تغيير الـ ID
saveIdBtn.addEventListener('click', () => {
    if (userIdInput.disabled) {
        // فتح الحقل للتعديل
        userIdInput.disabled = false;
        userIdInput.focus();
        saveIdBtn.textContent = "حفظ الـ ID 💾";
        localStorage.removeItem('prediction_user_id');
    } else {
        // حفظ الـ ID الجديد
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert("⚠️ يرجى إدخال اسمك أو الـ ID أولاً!");
            return;
        }
        localStorage.setItem('prediction_user_id', userId);
        userIdInput.disabled = true;
        saveIdBtn.textContent = "تغيير 🔄";
        alert("✅ تم حفظ الـ ID بنجاح!");
    }
});

// 1. جلب وعرض المباريات مع خاصية اللوغو ونظام 1X2 والـ Deadline
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    try {
        const querySnapshot = await getDocs(collection(db, "matches"));
        container.innerHTML = "";

        if (querySnapshot.empty) {
            container.innerHTML = `<div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 text-center text-slate-500">لا توجد مباريات متاحة حالياً. أضف مباراة من لوحة تحكم Firebase.</div>`;
            return;
        }

        const now = new Date();

        querySnapshot.forEach((docSnap) => {
            const match = docSnap.data();
            const matchId = docSnap.id;
            
            const matchTime = match.matchTime ? match.matchTime.toDate() : new Date();
            const isStarted = now >= matchTime;

            const cardWrapper = document.createElement('div');
            cardWrapper.className = "bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4";

            const topRow = document.createElement('div');
            topRow.className = "flex flex-col md:flex-row items-center justify-between gap-4";

            topRow.innerHTML = `
                <!-- الفريق المضيف -->
                <div class="flex items-center gap-3 w-full md:w-1/3 justify-start">
                    <img src="${match.homeLogo}" alt="${match.homeTeam}" class="w-12 h-12 object-contain bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <span class="font-bold text-white">${match.homeTeam}</span>
                </div>

                <!-- معلومات الموعد والـ Deadline -->
                <div class="text-center space-y-1 w-full md:w-1/3">
                    <span class="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        ${isStarted ? '🔴 انطلقت المباراة (مغلق)' : `⏰ ${matchTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </span>
                    <div class="text-xs text-slate-500 font-semibold">VS</div>
                </div>

                <!-- الفريق الضيف -->
                <div class="flex items-center gap-3 w-full md:w-1/3 justify-end">
                    <span class="font-bold text-white">${match.awayTeam}</span>
                    <img src="${match.awayLogo}" alt="${match.awayTeam}" class="w-12 h-12 object-contain bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                </div>
            `;

            // أزرار التوقع (1, X, 2)
            const actionsDiv = document.createElement('div');
            actionsDiv.className = "flex gap-2 w-full justify-center pt-2";

            const options = [
                { label: `فوز ${match.homeTeam}`, value: '1' },
                { label: 'تعادل (X)', value: 'X' },
                { label: `فوز ${match.awayTeam}`, value: '2' }
            ];

            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = `flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${isStarted ? 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed' : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500 hover:text-emerald-400'}`;
                btn.textContent = opt.label;

                if (!isStarted) {
                    btn.onclick = () => submitPrediction(matchId, opt.value, btn);
                }
                actionsDiv.appendChild(btn);
            });

            cardWrapper.appendChild(topRow);
            cardWrapper.appendChild(actionsDiv);
            container.appendChild(cardWrapper);
        });

    } catch (error) {
        console.error("خطأ في جلب المباريات:", error);
    }
}

// 2. إرسال التوقع وحفظه في Firebase مع تحديث جدول الترتيب بـ 0 نقاط مبدئياً
async function submitPrediction(matchId, choice, btnElement) {
    const userId = localStorage.getItem('prediction_user_id');

    if (!userId) {
        alert("⚠️ يرجى إدخال وحفظ الـ ID الخاص بك أولاً في الأعلى!");
        document.getElementById('currentUserId').focus();
        return;
    }

    try {
        const docId = `${userId}_${matchId}`;
        
        // 1. حفظ التوقع
        await setDoc(doc(db, "predictions", docId), {
            userId: userId,
            matchId: matchId,
            prediction: choice,
            timestamp: new Date()
        });

        // 2. التحقق مما إذا كان المستخدم موجوداً مسبقاً في جدول الترتيب، وإلا إضافته بـ 0 نقاط
        const userLeaderboardRef = doc(db, "leaderboard", userId);
        const userLeaderboardSnap = await getDoc(userLeaderboardRef);

        if (!userLeaderboardSnap.exists()) {
            await setDoc(userLeaderboardRef, {
                userId: userId,
                totalPoints: 0
            });
        }

        // تأثير بصري للزر
        const parent = btnElement.parentElement;
        parent.querySelectorAll('button').forEach(b => {
            b.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-400');
            b.classList.add('bg-slate-950', 'text-slate-300', 'border-slate-800');
        });
        btnElement.classList.remove('bg-slate-950', 'text-slate-300', 'border-slate-800');
        btnElement.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-400');

        alert(`✅ تم تسجيل توقعك (${choice}) بنجاح يا ${userId}!`);
        loadLeaderboard(); // تحديث الجدول فوراً ليظهر بـ 0 نقاط
    } catch (error) {
        console.error("خطأ في حفظ التوقع:", error);
        alert("❌ حدث خطأ أثناء إرسال التوقع.");
    }
}

// 3. جلب جدول الترتيب العام وعرضه
async function loadLeaderboard() {
    const tableBody = document.getElementById('leaderboardTable');
    try {
        const q = query(collection(db, "leaderboard"), orderBy("totalPoints", "desc"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = "";
        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-slate-500">لا توجد بيانات ترتيب حالياً.</td></tr>`;
            return;
        }

        let rank = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            tableBody.innerHTML += `
                <tr class="hover:bg-slate-800/40 transition">
                    <td class="py-3 px-4 font-bold text-emerald-400">#${rank}</td>
                    <td class="py-3 px-4 font-semibold text-white">${data.userId}</td>
                    <td class="py-3 px-4 font-bold text-cyan-400">${data.totalPoints || 0} نقطة</td>
                </tr>
            `;
            rank++;
        });
    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
    }
}

// تشغيل الوظائف فور فتح الموقع
loadMatches();
loadLeaderboard();
