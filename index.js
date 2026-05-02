const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PROXY_DIR = path.join(__dirname, 'proxy');

// 1. ルート直下のテスト
app.get('/', (req, res) => {
  res.send('test2');
});


// 1. 既存の /proxy エンドポイント用 (uvなどはここに含まれる)
app.use('/proxy', express.static(PROXY_DIR));

// 2. /prxy 以下の構造を解決するためのミドルウェア
app.use((req, res, next) => {
  // リクエストが /prxy から始まる場合のみ処理を行う
  if (req.path.startsWith('/prxy')) {
    
    // リクエストされたパス（例: /prxy/baremux/index.js）を 
    // 物理ディレクトリ（PROXY_DIR/prxy/baremux/index.js）に結合
    const targetFilePath = path.join(PROXY_DIR, req.path);

    // ファイルが存在し、かつディレクトリではない（ファイルである）ことを確認
    if (fs.existsSync(targetFilePath) && fs.lstatSync(targetFilePath).isFile()) {
      return res.sendFile(targetFilePath);
    }
  }

  // 該当しないリクエスト、またはファイルが見つからない場合は次のルーティングへ
  next();
});

// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
