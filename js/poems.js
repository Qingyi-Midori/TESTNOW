// 诗集加载与渲染逻辑（稳定 Masonry 布局）
document.addEventListener("DOMContentLoaded", () => {
  const poemsContainer = document.getElementById("poems");
  const sortAscBtn = document.getElementById("sort-asc-btn");
  const sortDescBtn = document.getElementById("sort-desc-btn");
  const columnSelect = document.getElementById("column-select");
  const toggleNumbers = document.getElementById("toggle-numbers");

  let poems = [];
  let userColumnChoice = "auto"; // 默认自动

  // 从 data/poems.txt 加载
  fetch("data/poems.txt")
    .then(res => res.text())
    .then(text => {
      poems = parsePoems(text);
      renderPoems(poems);
    })
    .catch(err => {
      console.error("加载诗集失败:", err);
      if (poemsContainer) poemsContainer.innerHTML = "<p>无法加载诗集。</p>";
    });

  // 解析 poems.txt：正文 + 日期（以 —— 开头）
  function parsePoems(text) {
    const blocks = text.split("---").map(b => b.trim()).filter(Boolean);
    return blocks.map((block, index) => {
      const lines = block.split("\n").map(l => l.replace(/\r/g, "").trim());
      const dateLineIndex = lines.findIndex(l => l.startsWith("——"));
      if (dateLineIndex === -1) return null;

      const dateStr = lines[dateLineIndex].replace(/^——\s*/, "");
      const content = lines.slice(0, dateLineIndex).join("\n"); // 保留换行
      return {
        id: index + 1,
        date: parseDateString(dateStr),
        dateStr,
        content
      };
    }).filter(Boolean);
  }

  function parseDateString(str) {
    const ymd = str.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
    if (ymd) return new Date(ymd[1], ymd[2] - 1, ymd[3]);
    const y = str.match(/^(\d{4})$/);
    if (y) return new Date(y[1], 0, 1);
    return new Date(0); // 兜底
  }

  // 渲染卡片
  function renderPoems(list) {
    poemsContainer.innerHTML = "";
    poemsContainer.style.height = "";
    list.forEach(poem => {
      const item = document.createElement("div");
      item.className = "grid-item";
      item.innerHTML = `
        <div class="card poem-card">
          <div class="poem-content">${escapeHtml(poem.content)}</div>
          <span class="date">——${poem.dateStr}</span>
          <span class="poem-number ${toggleNumbers && !toggleNumbers.checked ? 'hidden' : ''}">#${poem.id}</span>
        </div>
      `;
      poemsContainer.appendChild(item);
    });

    // 两帧布局：先设宽，再测高再定位
    masonryLayout();
  }

  // 用户可选列数的 Masonry 布局
  function masonryLayout() {
    const gap = 20;
    const minColWidth = 320; // 最小列宽，平衡美观与适配

    const containerWidth = poemsContainer.clientWidth;
    let columnCount;
    if (userColumnChoice !== "auto") {
      columnCount = Math.max(1, parseInt(userColumnChoice, 10) || 1);
    } else {
      columnCount = Math.max(1, Math.min(6, Math.floor((containerWidth + gap) / (minColWidth + gap))));
    }

    const itemWidth = Math.floor((containerWidth - gap * (columnCount - 1)) / columnCount);
    const items = Array.from(poemsContainer.children);
    if (items.length === 0) {
      poemsContainer.style.height = "";
      return;
    }

    // 设定容器
    poemsContainer.style.position = "relative";

    // 第一帧：统一宽度，避免测量错误
    requestAnimationFrame(() => {
      items.forEach(item => {
        item.style.width = `${itemWidth}px`;
        item.style.position = "absolute";
      });

      // 第二帧：读取高度，计算坐标
      requestAnimationFrame(() => {
        const colHeights = Array(columnCount).fill(0);

        items.forEach(item => {
          const h = item.offsetHeight;
          const colIndex = colHeights.indexOf(Math.min(...colHeights));
          const left = colIndex * (itemWidth + gap);
          const top = colHeights[colIndex];

          item.style.left = `${left}px`;
          item.style.top = `${top}px`;
          colHeights[colIndex] = top + h + gap;
        });

        // 设置容器高度
        const maxHeight = Math.max(...colHeights);
        poemsContainer.style.height = `${maxHeight}px`;
      });
    });
  }

  // 下拉框监听（如果存在）
  if (columnSelect) {
    columnSelect.addEventListener("change", (e) => {
      userColumnChoice = e.target.value;
      masonryLayout();
    });
  }

  // 编号显示开关（实时切换，无需重渲染）
  if (toggleNumbers) {
    toggleNumbers.addEventListener('change', () => {
      const nodes = poemsContainer.querySelectorAll('.poem-number');
      nodes.forEach(n => {
        if (toggleNumbers.checked) n.classList.remove('hidden');
        else n.classList.add('hidden');
      });
    });
  }

  // 排序
  sortAscBtn?.addEventListener("click", () => {
    const sorted = [...poems].sort((a, b) => a.id - b.id);
    renderPoems(sorted);
  });

  sortDescBtn?.addEventListener("click", () => {
    const sorted = [...poems].sort((a, b) => b.id - a.id);
    renderPoems(sorted);
  });

  // 窗口变化：防抖重排
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      masonryLayout();
    }, 150);
  });

  // 安全转义（避免特殊符号破坏 HTML）
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[s]));
  }
});
