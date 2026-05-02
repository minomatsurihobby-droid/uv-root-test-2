const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();


// 1. ルート直下のテスト
app.get('/', (req, res) => {
  res.send('test3');
});


const PROXY_DIR = path.join(__dirname, 'proxy');

/**
 * 静的ファイルの提供 (標準の /proxy へのアクセス用)
 */
app.use('/proxy', express.static(PROXY_DIR));

/**
 * 構成を考慮したエンドポイント解決ミドルウェア
 */
app.use((req, res, next) => {
    const reqPath = req.path;

    // 1. /prxy/ から始まるリクエストの処理
    // 例: /prxy/baremux/index.js -> [PROXY_DIR]/prxy/baremux/index.js
    if (reqPath.startsWith('/prxy/')) {
        const targetPath = path.join(PROXY_DIR, reqPath);
        if (isValidFile(targetPath)) {
            return res.sendFile(targetPath);
        }
    }

    // 2. ルート直下としてリクエストされた場合の処理 (フォールバック)
    // baremux, epoxy, libcurl, register-sw.mjs 等への直接アクセスを /proxy/prxy/ 内で探す
    const prxySubDirs = ['baremux', 'epoxy', 'libcurl'];
    const firstSegment = reqPath.split('/')[1];

    if (prxySubDirs.includes(firstSegment) || reqPath === '/register-sw.mjs') {
        // これらは /proxy/prxy/ の中にあるため、パスを再構成
        const targetPath = path.join(PROXY_DIR, 'prxy', reqPath);
        if (isValidFile(targetPath)) {
            return res.sendFile(targetPath);
        }
    }

    next();
});

/**
 * ファイルが有効（存在し、かつディレクトリではない）かチェックする補助関数
 */
function isValidFile(filePath) {
    try {
        return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
    } catch (e) {
        return false;
    }
}

// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
