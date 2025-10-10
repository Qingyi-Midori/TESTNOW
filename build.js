const fs   = require("fs");
const path = require("path");

// 确保 dist 目录存在
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// 复制目录函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// 复制静态资源
copyDir("css", path.join(distDir, "css"));
copyDir("js",  path.join(distDir, "js"));
copyDir("data", path.join(distDir, "data"));

// 读取公共区块
const header  = fs.readFileSync("header.html", "utf-8");
const sidebar = fs.readFileSync("sidebar.html", "utf-8");

// 把 favicon 标签直接写进 headCommon（路径用 /assets/favicons/...）
const headCommon = `
  <meta charset="UTF-8">
  <title>清依的博客</title>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">

  <!-- favicon -->
  <link rel="icon" type="image/png" sizes="96x96" href="/TESTNOW/assets/favicons/favicon-96x96.png">
  <link rel="icon" type="image/svg+xml" href="/TESTNOW/assets/favicons/favicon.svg">
  <link rel="shortcut icon" href="/TESTNOW/assets/favicons/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/TESTNOW/assets/favicons/apple-touch-icon.png">
  <meta name="apple-mobile-web-app-title" content="QingyiMidoriBlog">
  <link rel="manifest" href="/TESTNOW/assets/favicons/site.webmanifest">
`;

// 遍历所有 *.content.html
fs.readdirSync(__dirname)
  .filter(file => file.endsWith(".content.html"))
  .forEach(file => {
    const content    = fs.readFileSync(file, "utf-8");
    const outputFile = file.replace(".content.html", ".html");
    const pageName   = outputFile.replace(".html", "");

    const pageCss = fs.existsSync(`css/${pageName}.css`)
      ? `<link rel="stylesheet" href="css/${pageName}.css">`
      : "";

    const extraJs = outputFile === "poems.html"
      ? '<script src="js/poems.js"></script>'
      : "";

    const html = `<!DOCTYPE html>
<html lang="zh">
<head>
${headCommon}
${pageCss}
</head>
<body>
  ${header}
  <div class="layout">
    ${sidebar}
    <main class="content">${content}</main>
    <div></div>
  </div>
  <script src="js/common.js"></script>${extraJs}
</body>
</html>`;

    fs.writeFileSync(path.join(distDir, outputFile), html.trim());
    console.log(`✅ 已生成: ${outputFile}`);
  });

// 复制 favicon 资源
const favSrc  = path.join(__dirname, "assets", "favicons");
const favDest = path.join(distDir, "assets", "favicons");
if (fs.existsSync(favSrc)) {
  if (!fs.existsSync(favDest)) fs.mkdirSync(favDest, { recursive: true });
  copyDir(favSrc, favDest);
  console.log("✅ favicons copied");
} else {
  console.warn("⚠️ 未发现 assets/favicons，请先放图标文件");
}