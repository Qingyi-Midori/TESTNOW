const poemsContainer = document.getElementById("poems");
const footerContainer = document.querySelector(".poem-footer");
const sortAscBtn = document.getElementById("sort-asc-btn");
const sortDescBtn = document.getElementById("sort-desc-btn");

let allPoems = [];
let msnry = null;

function initMasonry() {
  if (msnry) {
    msnry.destroy();
    msnry = null;
  }
  msnry = new Masonry(poemsContainer, {
    itemSelector: '.grid-item',
    columnWidth: '.grid-item',
    percentPosition: true,
    gutter: 20
  });
}

function renderPoems(poemsToRender) {
  poemsContainer.innerHTML = "";
  poemsToRender.forEach(poem => {
    const card = document.createElement("div");
    card.className = "poem-card card grid-item";
    const dateHtml = poem.dateStr ? `<span class="date">${poem.dateStr}</span>` : '';
    const formattedPoemText = poem.text.replace(/\n/g, "<br>");
    card.innerHTML = `<p>${formattedPoemText}</p>${dateHtml}`;
    poemsContainer.appendChild(card);
  });
  initMasonry();
}

function parseAndStorePoems(text) {
  const poems = text.split("---");
  const dateRegex = /(\r?\n|^)——\s*(\d{4}(?:\.\d{1,2}(?:\.\d{1,2})?)?)\s*$/m;

  allPoems = poems
    .map((p, index) => {
      const poemText = p.trim();
      if (!poemText) return null;

      let processedText = poemText;
      let dateStr = null;
      let dateObj = null;

      const match = processedText.match(dateRegex);
      if (match) {
        dateStr = match[2];
        if (!/^\d{4}$/.test(dateStr)) {
          const parsableDateStr = dateStr.replace(/\./g, "-");
          const d = new Date(parsableDateStr);
          if (!isNaN(d.getTime())) {
            dateObj = d;
          }
        }
        processedText = processedText.replace(dateRegex, "").trim();
      }

      return {
        text: processedText,
        dateStr,
        dateObj,
        originalIndex: index
      };
    })
    .filter(Boolean);
}

function sortPoems(order = "desc") {
  allPoems.sort((a, b) => {
    if (a.dateObj && b.dateObj) {
      return order === "asc" ? a.dateObj - b.dateObj : b.dateObj - a.dateObj;
    }
    if (a.dateObj && !b.dateObj) return -1;
    if (!a.dateObj && b.dateObj) return 1;
    return a.originalIndex - b.originalIndex;
  });
  renderPoems(allPoems);
}

// 初始化页脚
(function initFooter() {
  const lastWillEl = document.createElement("div");
  lastWillEl.className = "last-will-text";
  lastWillEl.innerHTML = "诞于星<br>归于尘";
  footerContainer.appendChild(lastWillEl);
})();

// 加载诗集
fetch("poems.txt")
  .then(res => res.text())
  .then(text => {
    parseAndStorePoems(text);
    sortPoems("desc"); // 默认倒序
  })
  .catch(error => {
    console.error("Error fetching poems:", error);
    poemsContainer.innerHTML = "<p>诗集加载失败，请检查 poems.txt 文件是否存在。</p>";
  });

// 绑定按钮
sortAscBtn.addEventListener("click", () => sortPoems("asc"));
sortDescBtn.addEventListener("click", () => sortPoems("desc"));
