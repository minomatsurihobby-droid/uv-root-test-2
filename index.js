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

app.use(['/uv', '/prxy'], (req, res, next) => {
    const targetPath = path.join(PROXY_DIR, req.path);

    const normalizedPath = path.normalize(targetPath);
    if (!normalizedPath.startsWith(PROXY_DIR)) {
        return next();
    }

    try {
        const stats = fs.statSync(targetPath);
        if (stats.isFile()) {
            return res.sendFile(targetPath);
        }
    } catch (err) {
    }

    next();
});

app.use('/proxy', express.static(PROXY_DIR));



// Vercel環境およびローカルでの起動用
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running!`);
});

module.exports = app;
