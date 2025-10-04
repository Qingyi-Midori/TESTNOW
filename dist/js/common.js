// 加载导航栏
fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;

    // 智能隐藏逻辑
    let lastScrollY = window.scrollY;
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
      if (window.scrollY > lastScrollY) {
        header.classList.add("hide");
      } else {
        header.classList.remove("hide");
      }
      lastScrollY = window.scrollY;
    });
  });

// 加载个人卡片
fetch("sidebar.html")
  .then(res => res.text())
  .then(html => document.getElementById("sidebar").innerHTML = html);
