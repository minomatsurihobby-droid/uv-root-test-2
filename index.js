const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();


// 1. ルート直下のテスト
app.get('/', (req, res) => {
  res.send('test4');
});

const PROXY_DIR = path.join(__dirname, 'proxy');

/**
 * 構成の前提:
 * PROXY_DIR/
 * ├── uv/ (sw.js, uv.bundle.js, etc.)
 * └── prxy/
 *     ├── baremux/ (index.js, worker.js, etc.)
 *     ├── epoxy/ (index.js, etc.)
 *     ├── libcurl/ (index.js, etc.)
 *     └── register-sw.mjs
 */

// 1. 通常の /proxy/ エンドポイントでのアクセスも許可
app.use('/proxy', express.static(PROXY_DIR));

// 2. /uv/ や /prxy/ で始まるリクエストを自動的に /proxy/ 内部へルーティングするミドルウェア
app.use((req, res, next) => {
    // リクエストされたパス（例: /prxy/baremux/index.js）を PROXY_DIR と結合
    // これにより自動的に /proxy/prxy/baremux/index.js を指すようになります
    const targetPath = path.join(PROXY_DIR, req.path);

    // セキュリティ対策: PROXY_DIR 外のファイルへのアクセスを防止
    const normalizedPath = path.normalize(targetPath);
    if (!normalizedPath.startsWith(PROXY_DIR)) {
        return next();
    }

    try {
        // ファイルが存在し、かつディレクトリではないことを確認
        if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isFile()) {
            // 正しいMIMEタイプでファイルを返却
            return res.sendFile(targetPath);
        }
    } catch (err) {
        // ファイルシステムエラーが発生した場合はログを出力して次へ
        console.error(`File access error: ${err}`);
    }

    // ファイルが見つからない場合は次のミドルウェア（404処理など）へ
    next();
});

// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
