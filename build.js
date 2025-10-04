const fs = require("fs");
const path = require("path");

// 确保 dist 目录存在
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// 读取公共区块
const header = fs.readFileSync("header.html", "utf-8");
const sidebar = fs.readFileSync("sidebar.html", "utf-8");

// 公共 head 部分（可以按需扩展）
const head = `
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

    const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
${head}
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
  ${outputFile === "poems.html" ? '<script src="js/poems.js"></script>' : ""}
</body>
</html>
    `;

    fs.writeFileSync(path.join(distDir, outputFile), html.trim());
    console.log(`生成完成: ${outputFile}`);
  });
