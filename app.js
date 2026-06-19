let students = [];
let teachers = [];
let seats = [];

async function init() {
  // 1. 一進網頁立刻先渲染首頁畫面，解決空白問題
  goHome();

  // 💡 這裡是要新增的部分：監聽搜尋框，按下 Enter 時強制觸發 search() 跳回搜尋結果
  const searchBox = document.getElementById("searchBox");
  if (searchBox) {
    searchBox.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        search();
      }
    });
  }

  // 2. 在背景非同步下載資料，不卡住畫面（維持你原本的寫法）
  try {
    const [studentsData, teachersData, seatsData] = await Promise.all([
      fetch("data/students.json").then(r => r.json()).catch(() => []),
      fetch("data/teachers.json").then(r => r.json()).catch(() => []),
      fetch("data/seatmaps.json").then(r => r.json()).catch(() => [])
    ]);

    students = studentsData;
    teachers = teachersData;
    seats = seatsData;
  } catch (error) {
    console.error("背景資料載入失敗，但首頁仍可正常顯示:", error);
  }
}

/* ===== 首頁 ===== */
function goHome() {
  document.getElementById("app").innerHTML = `
    <div class="list home-container">
      <div class="logo-wrapper">
        <img src="data/img/logo.png" alt="學校校徽" class="school-logo" onerror="this.style.display='none'; console.log('校徽圖片載入失敗，請檢查路徑是否正確');" />
      </div>

      <div class="rules-wrapper">
        <h2>校規</h2>
        <ul class="rules-list">
          <li class="highlight">主辦有隨時新增更改校規的權利</li>
          <li>要求共用時請打上你是誰（學生名字幾年幾班）、要做什麼</li>
          <li>禁止未經他人同意擅自使用他人創作，如表符、描改 2 次創作等</li>
          <li>學生號隨便填，1145141919 都可以</li>
          <li>有事請透過信箱聯絡：<a href="mailto:wannaoupaila@gmail.com">wannaoupaila@gmail.com</a></li>
          <li>VT 不要直接 V 皮複製貼上加個制服就當自己的創作</li>
          <li class="alert">名字被更改為紅色的學生和教師是有疑慮的同學，部分原因是學生、教師證有問題或是沒有在雲端裡建檔，請各位自己多加注意</li>
          <li>這是繪圖企劃，不會畫圖、沒在畫圖的最少寫文，不限畫技願意畫都能玩</li>
          <li>沒參加過或是不理解的請在 Google 上查詢「噗浪繪圖企劃、FB 繪圖企劃」</li>
          <li>報名複數同學的人請每個都附上自己的推特連結</li>
          <li>請先畫完學生證再選班和建檔（人數超過會再開設新班）</li>
          <li>選完座位請一定要附上自己的推特連結</li>
          <li>選完位置後就不要再移動</li>
          <li class="alert">自由創作但不允許拿其他同學的圖去給 AI，被發現的學生我們會勒令退學</li>
          <li>自由創作意旨 Q 版、插圖、漫畫、動畫，文章。並不包含 AI</li>
          <li>文手也需準備證件照（紙娃娃或是委託也可）</li>
          <li>要畫圖要做什麼事情時請關閉試算表，不要在這邊掛機，這樣大家都會無法編輯</li>
          <li class="highlight">定期審核，違反規則的人會直接將你的角色移除</li>
          <li>學校的提問箱，有任何問題可以在這裡詢問，或是看有沒有人問過：
            <a href="https://x.com/INU_Art_/status/2063831994635833671?s=20" target="_blank" class="box-link">【提問箱】</a> 
            不要私訊打擾小精靈
          </li>
        </ul>
      </div>
    </div>
  `;
}

/* ===== 學生列表 ===== */
function loadStudents() {
  document.getElementById("app").innerHTML = `
    <div class="list">
      <h2>學生列表</h2>
      ${students.map(s => `
        <div class="card" onclick="openProfile('${s.id}')">
          ${s.name}（${s.grade}年${s.class}班）
        </div>
      `).join("")}
    </div>
  `;
}

/* ===== 教師列表 ===== */
function loadTeachers() {
  document.getElementById("app").innerHTML = `
    <div class="list">
      <h2>教師列表</h2>
      ${teachers.map(t => `
        <div class="card" onclick="openTeacher('${t.id}')">
          ${t.name} <small style="color: #666;">（${t.group}）</small>
        </div>
      `).join("")}
    </div>
  `;
}

/* ===== 🏫 班級頁 ===== */
function loadClasses() {
  const classes = [...new Set(students.map(s => `${s.grade}${s.class}`))];

  document.getElementById("app").innerHTML = `
    <div class="list">
      <h2>班級列表</h2>
      <div class="grid">
        ${classes.map(c => `
          <div class="classBox" onclick="openClass('${c}')">
            ${c}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/* ===== 班級內容 ===== */
function openClass(classId) {
  const grade = classId[0];
  const cls = classId[1];

  const list = students.filter(s =>
    String(s.grade) === grade && s.class === cls
  );

  document.getElementById("app").innerHTML = `
    <div class="list">
      <h2>${grade}年${cls}班</h2>
      ${list.map(s => `
        <div class="card" onclick="openProfile('${s.id}')">
          ${s.name}
        </div>
      `).join("")}
    </div>
  `;
}

/* ===== 座位表 ===== */
function loadSeatmaps() {
  const grades = [...new Set(seats.map(s => s.grade))];

  document.getElementById("app").innerHTML = `
    <div class="seatmap">
      <h2>座位表</h2>
      <select onchange="showSeat(this.value)">
        ${seats.map(s => `
          <option value="${s.grade}${s.class}">
            ${s.grade}年${s.class}班
          </option>
        `).join("")}
      </select>
      <div id="seatView"></div>
    </div>
  `;

  showSeat(seats[0].grade + seats[0].class);
}

/* ===== 顯示座位圖 ===== */
function showSeat(classId) {
  const s = seats.find(x => `${x.grade}${x.class}` === classId);
  document.getElementById("seatView").innerHTML = `
    <img src="${s.image}" />
  `;
}

/* ===== 角色頁（支援 PNG/JPG 雙格式版） ===== */
async function openProfile(id) { 
  const data = students.find(x => x.id === id);

  if (!data) {
    document.getElementById("app").innerHTML = `
      <div class="list"><h2>找不到該學生的資料 😢</h2></div>
    `;
    return;
  }

  const imgPath = `data/students/${data.id}/card.png`; 
  const introPath = `data/students/${data.id}/intro.txt`;
  let introText = "這個學生很神祕，目前還沒有填寫個人簡介。";

  try {
    const response = await fetch(introPath);
    if (response.ok) {
      introText = await response.text(); 
    }
  } catch (error) {
    console.error(`無法載入 ${data.name} 的簡介檔案:`, error);
  }

  document.getElementById("app").innerHTML = `
    <div class="profile">
      <img src="${imgPath}" alt="${data.name}" 
           onerror="if(!this.dataset.retry){ this.dataset.retry=true; this.src='data/students/${data.id}/card.jpg'; } else { this.onerror=null; this.src='images/default.png'; }" />

      <div class="info">
        <h2>${data.name}</h2>
        <p>${data.grade}年${data.class}班</p>
        <p style="white-space: pre-wrap;">${introText}</p>
        <small>${(data.tags || []).join(" / ") || " "}</small>
      </div>
    </div>
  `;
}

/* ===== 教師頁（支援 PNG/JPG 雙格式版） ===== */
async function openTeacher(id) { 
  const data = teachers.find(x => x.id === id);

  if (!data) {
    document.getElementById("app").innerHTML = `
      <div class="list"><h2>找不到該教師的資料 😢</h2></div>
    `;
    return;
  }

  const imgPath = `data/teachers/${data.id}/card.png`; 
  const introPath = `data/teachers/${data.id}/intro.txt`;
  let introText = "這位老師很神祕，目前還沒有填寫教師簡介。";

  try {
    const response = await fetch(introPath);
    if (response.ok) {
      introText = await response.text(); 
    }
  } catch (error) {
    console.error(`無法載入 ${data.name} 老師的簡介檔案:`, error);
  }

  document.getElementById("app").innerHTML = `
    <div class="profile">
      <img src="${imgPath}" alt="${data.name}" 
           onerror="if(!this.dataset.retry){ this.dataset.retry=true; this.src='data/teachers/${data.id}/card.jpg'; } else { this.onerror=null; this.src='data/teachers/images/default.png'; }" />

      <div class="info">
        <h2>${data.name}</h2>
        <p style="color: #666; font-weight: bold;">💼 職位：${data.group}</p>
        <p style="white-space: pre-wrap;">${introText}</p>
        <small>${(data.tags || []).join(" / ") || "　"}</small>
      </div>
    </div>
  `;
}

/* ===== 搜尋（支援學生/教師雙系統版） ===== */
function search() {
  const q = document.getElementById("searchBox").value.toLowerCase().trim();

  // 💡 優化：如果搜尋框被清空了，就自動返回首頁，避免畫面被所有人塞滿卡死
  if (q === "") {
    goHome();
    return;
  }

  // 1. 分別過濾符合條件的學生與教師
  const resultStudents = students.filter(s =>
    s.name.toLowerCase().includes(q)
  );
  
  const resultTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(q)
  );

  // 2. 渲染搜尋結果頁面
  document.getElementById("app").innerHTML = `
    <div class="list">
      <h2>🔍 搜尋結果</h2>
      
      ${resultStudents.length > 0 ? `
        <h3 style="margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">👨‍🎓 學生人員 (${resultStudents.length})</h3>
        ${resultStudents.map(s => `
          <div class="card" onclick="openProfile('${s.id}')">
            ${s.name}（${s.grade}年${s.class}班）
          </div>
        `).join("")}
      ` : ""}

      ${resultTeachers.length > 0 ? `
        <h3 style="margin-top: 25px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">👩‍🏫 教職人員 (${resultTeachers.length})</h3>
        ${resultTeachers.map(t => `
          <div class="card" onclick="openTeacher('${t.id}')">
            ${t.name} <small style="color: #666;">（${t.group}）</small>
          </div>
        `).join("")}
      ` : ""}

      ${resultStudents.length === 0 && resultTeachers.length === 0 ? `
        <p style="color: #888; margin-top: 30px; text-align: center;">找不到符合「${q}」的學生或教師 😢</p>
      ` : ""}
    </div>
  `;
}

init();