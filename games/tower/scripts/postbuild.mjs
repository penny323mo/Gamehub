// Rewrites the Vite-emitted module script tag into a plain deferred script so
// dist/index.html works under file:// and GitHub Pages without ES-module CORS issues.
// Idempotent: safe to run multiple times. Fails loudly if the tag can't be found.
import fs from 'node:fs';

const path = 'dist/index.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replace(
    /<script\b[^>]*\bsrc="(\.\/assets\/[^"]+\.js)"[^>]*><\/script>/g,
    '<script defer src="$1"></script>'
);

if (!/<script defer src="\.\/assets\//.test(html)) {
    throw new Error('postbuild: no <script defer src="./assets/..."> tag in dist/index.html — build output changed?');
}

fs.writeFileSync(path, html);
console.log('postbuild: script tag rewritten OK');
