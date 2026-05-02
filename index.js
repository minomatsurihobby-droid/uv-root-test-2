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
app.use(['/uv', '/prxy'], (req, res, next) => {
    // 1. baseUrl（/uv または /prxy）と残りのパスを結合してフルパスを作成
    // req.baseUrl は '/uv' や '/prxy'、req.path は '/sw.js' や '/baremux/index.js'
    const targetPath = path.join(PROXY_DIR, req.baseUrl, req.path);

    // 2. セキュリティチェック（ディレクトリトラバーサル防止）
    const normalizedPath = path.normalize(targetPath);
    if (!normalizedPath.startsWith(PROXY_DIR)) {
        return next();
    }

    // 3. ファイルの存在確認と返却
    // 特定のディレクトリ宛てであることが確定しているため、負荷の影響は限定的です
    fs.stat(targetPath, (err, stats) => {
        if (!err && stats.isFile()) {
            return res.sendFile(targetPath);
        }
        // ファイルがない、またはエラーの場合は速やかに次の処理（404など）へ
        next();
    });
});

// 予備：もし /proxy/filename で直接アクセスが来た場合用
app.use('/proxy', express.static(PROXY_DIR));

// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
