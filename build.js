const fs = require("fs");
const path = require("path");

// 确保 dist 目录存在
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

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
copyDir("js", path.join(distDir, "js"));
copyDir("data", path.join(distDir, "data")); // ✅ 新增：复制 data 文件夹

// 读取公共区块
const header = fs.readFileSync("header.html", "utf-8");
const sidebar = fs.readFileSync("sidebar.html", "utf-8");

// 公共 head 部分
const headCommon = `
  <meta charset="UTF-8">
  <title>清依的博客</title>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
`;

// 遍历所有 *.content.html 文件
fs.readdirSync(__dirname)
  .filter(file => file.endsWith(".content.html"))
  .forEach(file => {
    const content = fs.readFileSync(file, "utf-8");
    const outputFile = file.replace(".content.html", ".html");
    const pageName = outputFile.replace(".html", "");

    // 每个页面单独的样式文件
    const pageCss = fs.existsSync(`css/${pageName}.css`)
      ? `<link rel="stylesheet" href="css/${pageName}.css">`
      : "";

    // poems 页面需要额外的 JS
    const extraJs = outputFile === "poems.html"
      ? '<script src="js/poems.js"></script>'
      : "";

    const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
${headCommon}
${pageCss}
</head>
<body>
  ${header}
  <div class="layout">
    ${sidebar}
    <main class="content">
      ${content}
    </main>
    <div></div>
  </div>
  <script src="js/common.js"></script>
  ${extraJs}
</body>
</html>
    `;

    fs.writeFileSync(path.join(distDir, outputFile), html.trim());
    console.log(`✅ 已生成: ${outputFile}`);
  });
