const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();


app.get('/', (req, res) => {
  res.send('test5');
});


/**
 * PROXY_DIR/
 * ├── uv/ (sw.js, uv.bundle.js, etc.)
 * └── prxy/
 *     ├── baremux/ (index.js, worker.js, etc.)
 *     ├── epoxy/ (index.js, etc.)
 *     ├── libcurl/ (index.js, etc.)
 *     └── register-sw.mjs
 */
const PROXY_DIR = path.join(__dirname, 'proxy');

app.use('/proxy', express.static(PROXY_DIR));


app.use(/^\/(uv|prxy)\/.*/, (req, res, next) => {
    // req.baseUrl ではなく req.originalUrl (または req.path) を使用
    const targetPath = path.join(PROXY_DIR, req.path);

    // セキュリティ: ディレクトリトラバーサル対策
    const normalizedPath = path.normalize(targetPath);
    if (!normalizedPath.startsWith(PROXY_DIR)) {
        return next();
    }

    // ファイルの存在確認と送信
    // このブロックは /uv/... か /prxy/... の時しか実行されないので超軽量です
    fs.stat(targetPath, (err, stats) => {
        if (!err && stats.isFile()) {
            return res.sendFile(targetPath);
        }
        // ファイルがない、あるいはエラーの場合は静かに next() して通常の 404 等へ流す
        next();
    });
});


// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
