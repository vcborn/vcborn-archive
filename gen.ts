import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { format } from "date-fns";

const contentsDir = path.join(__dirname, "src", "contents");
const outputFilePath = path.join(__dirname, "src", "articles.html");

// Markdown files を読み取り、<details> タグにまとめる
const generateArticlesHTML = () => {
  const files = fs
    .readdirSync(contentsDir)
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => {
      const aDate = matter(fs.readFileSync(path.join(contentsDir, a), "utf-8"))
        .data.date;
      const bDate = matter(fs.readFileSync(path.join(contentsDir, b), "utf-8"))
        .data.date;
      return new Date(bDate).getTime() - new Date(aDate).getTime(); // 新しい順にソート
    });

  const detailSections = files
    .map((file, i) => {
      const filePath = path.join(contentsDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const title = data.title || "無題";
      const date = data.date || "日付不明";

      const htmlContent = marked(content);
      return `
<details class="mb-4 bg-white rounded-md shadow p-4"${i === 0 ? " open" : ""}>
  <summary class="cursor-pointer font-semibold text-lg">${title} <span class="text-sm text-gray-500">(${format(
        date,
        "yyyy年MM月dd日"
      )})</span></summary>
  <div class="prose mt-4">${htmlContent}</div>
</details>
`;
    })
    .join("\n");

  const fullHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>記事一覧</title>
  <link href="./styles/output.css" rel="stylesheet" />
</head>
<body class="bg-gray-50 p-6">
  <main class="max-w-3xl mx-auto">
    ${detailSections}
  </main>
</body>
</html>
`;

  fs.writeFileSync(outputFilePath, fullHTML, "utf-8");
  console.log("✅ articles.html を生成しました。");
};

generateArticlesHTML();
