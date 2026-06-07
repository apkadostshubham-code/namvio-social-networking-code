const fs = require('fs');
const root = 'C:/Users/ADMIN/OneDrive/Apps/namvio-ecosystem-app';

const html = fs.readFileSync(`${root}/index.html`, 'utf8');
const router = fs.readFileSync(`${root}/assets/js/app-router.js`, 'utf8');
const css = fs.readFileSync(`${root}/assets/css/custom-style.css`, 'utf8');

const scripts = [...html.matchAll(/<script src="assets\/js\/([^"]+)"/g)].map((m) => m[1]);
const dupes = scripts.filter((s, i) => scripts.indexOf(s) !== i);
const cacheVersions = [...new Set((html.match(/\?v=(\d{8})/g) || []).map((x) => x.replace('?v=', '')))];

console.log('index.html', html.length, 'bytes');
console.log('custom-style.css', css.length, 'bytes');
console.log('app-router.js', router.length, 'bytes');
console.log('script tags', scripts.length, 'duplicates', dupes.length);
console.log('views', {
    admin: html.includes('view-admin'),
    legal: html.includes('view-legal'),
    support: html.includes('view-support'),
    guide: html.includes('view-guide'),
    rules: html.includes('view-rules'),
    help: html.includes('view-help'),
    chats: html.includes('view-chats'),
    hof: html.includes('view-hof'),
    rightSidebar: html.includes('nv-right-sidebar')
});
console.log('router hooks', {
    motion: router.includes('NamvioMotion.onRouteChange'),
    marketplace: router.includes('function initMarketplace'),
    identity: router.includes("viewId === 'identity'"),
    support: router.includes("viewId === 'support'")
});
console.log('cache', cacheVersions.length === 1 ? cacheVersions[0] : cacheVersions);

const ok =
    !dupes.length &&
    cacheVersions.length === 1 &&
    html.includes('view-support') &&
    html.includes('view-legal') &&
    !html.includes('view-chats');

process.exit(ok ? 0 : 1);