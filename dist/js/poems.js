// 诗集加载与渲染逻辑
document.addEventListener("DOMContentLoaded", () => {
  const poemsContainer = document.getElementById("poems");
  const sortAscBtn = document.getElementById("sort-asc-btn");
  const sortDescBtn = document.getElementById("sort-desc-btn");

  let poems = [];

  // 从 data/poems.txt 加载
  fetch("data/poems.txt")
    .then(res => res.text())
    .then(text => {
      poems = parsePoems(text);
      renderPoems(poems);
    })
    .catch(err => {
      console.error("加载诗集失败:", err);
      poemsContainer.innerHTML = "<p>无法加载诗集。</p>";
    });

  // 解析 poems.txt
  function parsePoems(text) {
    // 假设每首诗用 --- 分隔，第一行是标题，第二行是日期，其余是正文
    return text.split("---").map(block => {
      const lines = block.trim().split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 3) return null;
      return {
        title: lines[0],
        date: new Date(lines[1]),
        content: lines.slice(2).join("<br>")
      };
    }).filter(Boolean);
  }

  // 渲染诗集
  function renderPoems(list) {
    poemsContainer.innerHTML = "";
    list.forEach(poem => {
      const card = document.createElement("div");
      card.className = "poem-card";
      card.innerHTML = `
        <h2>${poem.title}</h2>
        <p class="date">${poem.date.toLocaleDateString()}</p>
        <div class="content">${poem.content}</div>
      `;
      poemsContainer.appendChild(card);
    });
    applyMasonry();
  }

  // Masonry 瀑布流布局
  function applyMasonry() {
    const cards = [...poemsContainer.children];
    const columnCount = 3; // 可以根据屏幕宽度调整
    const columns = Array.from({ length: columnCount }, () => []);

    cards.forEach((card, i) => {
      columns[i % columnCount].push(card);
    });

    poemsContainer.innerHTML = "";
    columns.forEach(col => {
      const colDiv = document.createElement("div");
      colDiv.className = "poem-column";
      col.forEach(card => colDiv.appendChild(card));
      poemsContainer.appendChild(colDiv);
    });
  }

  // 排序按钮
  sortAscBtn.addEventListener("click", () => {
    const sorted = [...poems].sort((a, b) => a.date - b.date);
    renderPoems(sorted);
  });

  sortDescBtn.addEventListener("click", () => {
    const sorted = [...poems].sort((a, b) => b.date - a.date);
    renderPoems(sorted);
  });
});
