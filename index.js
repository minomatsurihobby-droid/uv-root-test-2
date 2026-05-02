const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();


app.get('/', (req, res) => {
  res.send('test4');
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

app.use('/uv', express.static(path.join(PROXY_DIR, 'uv'), {
    index: false, // ディレクトリ自体へのアクセスを禁止
    immutable: true,
    maxAge: '1d' // 必要に応じてキャッシュ設定
}));

// /prxy/baremux/index.js や /prxy/register-sw.mjs を PROXY_DIR/prxy 内から探す
// 内部にディレクトリ（baremux等）があっても express.static が自動で再帰的に探してくれます
app.use('/prxy', express.static(path.join(PROXY_DIR, 'prxy'), {
    index: false,
    immutable: true,
    maxAge: '1d'
}));

// もし /proxy/ というフルパスでのアクセスも維持したい場合
app.use('/proxy', express.static(PROXY_DIR));


// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
