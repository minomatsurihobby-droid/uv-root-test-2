const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();


app.get('/', (req, res) => {
  res.send('test4');
});

const PROXY_DIR = path.join(__dirname, 'proxy');

/**
 * PROXY_DIR/
 * ├── uv/ (sw.js, uv.bundle.js, etc.)
 * └── prxy/
 *     ├── baremux/ (index.js, worker.js, etc.)
 *     ├── epoxy/ (index.js, etc.)
 *     ├── libcurl/ (index.js, etc.)
 *     └── register-sw.mjs
 */

app.use('/proxy', express.static(PROXY_DIR));

app.use((req, res, next) => {
    // リクエストされたパスを PROXY_DIR と結合
    const targetPath = path.join(PROXY_DIR, req.path);

    const normalizedPath = path.normalize(targetPath);
    if (!normalizedPath.startsWith(PROXY_DIR)) {
        return next();
    }

    try {
        if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isFile()) {
            // サービスワーカー登録のためMIMEタイプでファイルを返却
            return res.sendFile(targetPath);
        }
    } catch (err) {
        console.error(`File access error: ${err}`);
    }
    next();
});

// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
