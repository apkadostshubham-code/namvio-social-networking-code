/**
 * Scan index.html inline handlers and ensure every top-level function exists on window after boot.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const scriptRe = /<script src="([^"]+\.js[^"]*)"><\/script>/g;
const localScripts = [];
let m;
while ((m = scriptRe.exec(html))) {
    const src = m[1].split('?')[0];
    if (src.startsWith('assets/')) localScripts.push(path.join(ROOT, src));
}

const viewIds = [...new Set([...html.matchAll(/id="(view-[^"]+)"/g)].map((x) => x[1]))];
const nodes = {};
viewIds.forEach((id) => {
    nodes[id] = {
        id,
        classList: {
            _c: new Set(['nv-routing-view', 'd-none']),
            add(...a) { a.forEach((x) => this._c.add(x)); },
            remove(...a) { a.forEach((x) => this._c.delete(x)); },
            toggle(x, on) { on ? this._c.add(x) : this._c.delete(x); },
            contains(x) { return this._c.has(x); }
        },
        innerHTML: '',
        dataset: {},
        style: {},
        appendChild() {},
        querySelector: () => null,
        querySelectorAll: () => []
    };
});

function makeContainer(id) {
    const childNodes = [];
    return {
        id,
        classList: { _c: new Set(), add() {}, remove() {}, toggle() {}, contains: () => false },
        innerHTML: '',
        get children() {
            return childNodes;
        },
        dataset: {},
        style: {},
        value: '',
        appendChild(child) { childNodes.push(child); },
        querySelector(sel) {
            if (sel === '[data-sponsored-feed]') return null;
            return null;
        },
        querySelectorAll: () => [],
        insertAdjacentHTML(pos, html) {
            const stub = { dataset: {}, insertAdjacentHTML() {}, outerHTML: html };
            if (pos === 'afterbegin' || pos === 'beforeend') childNodes.push(stub);
        }
    };
}

['subscription-plans-grid', 'billing-history-body', 'feed-post-textarea',
    'trending-keywords-box', 'trending-keywords-mobile', 'recent-domain-sales-box',
    'market-pulse-sales-box', 'nv-sidebar-nav-host', 'nv-mobile-nav-host', 'nv-bottom-nav-inner',
    'header-main-nav', 'sp-amount-grid', 'legal-accordion', 'gd-sections-col', 'rules-sections-col',
    'help-hub-grid', 'msg-thread-list', 'sidebar-display-name', 'sidebar-handle', 'sidebar-rep-line'
].forEach((id) => {
    if (!nodes[id]) {
        nodes[id] = {
            id,
            classList: { _c: new Set(), add() {}, remove() {}, toggle() {}, contains: () => false },
            innerHTML: '',
            value: '',
            dataset: {},
            style: {},
            appendChild() {},
            querySelector: () => null,
            querySelectorAll: (sel) => {
                if (sel === '#subscription-plans-grid [data-plan-id]') {
                    return [{ getAttribute: () => 'free', querySelector: () => ({ innerHTML: '' }) }];
                }
                return [];
            }
        };
    }
});

nodes['feed-pipeline-cards'] = makeContainer('feed-pipeline-cards');

const document = {
    getElementById: (id) => nodes[id] || null,
    querySelector: (sel) => {
        if (sel === 'body') return { classList: { add() {}, remove() {}, toggle() {} } };
        if (sel && sel.startsWith('#')) return nodes[sel.slice(1)] || null;
        return null;
    },
    querySelectorAll: () => [],
    body: { classList: { add() {}, remove() {}, toggle() {} } },
    readyState: 'complete',
    addEventListener: () => {},
    createElement: () => ({ textContent: '', innerHTML: '', appendChild() {} })
};

const bootErrors = [];
const window = {
    document,
    location: { hash: '', origin: 'http://localhost' },
    addEventListener: () => {},
    innerWidth: 1280,
    scrollTo: () => {},
    setTimeout,
    clearTimeout,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    jQuery: () => ({ collapse: () => {} }),
    alert: () => {},
    confirm: () => true,
    localStorage: { getItem: () => null, setItem: () => {} }
};

const console = {
    log: () => {},
    warn: (...a) => bootErrors.push(a.join(' ')),
    error: (...a) => bootErrors.push(a.join(' '))
};

const ctx = vm.createContext({ window, document, console, localStorage: window.localStorage, setTimeout, clearTimeout, requestAnimationFrame: window.requestAnimationFrame, jQuery: window.jQuery });

for (const file of localScripts) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
}

Object.keys(window).forEach((k) => { if (/^(Namvio|NAMEBIO|DOMAIN)/.test(k)) ctx[k] = window[k]; });

const handlerRe = /on(?:click|change|submit|keyup|keydown|input)="([^"]+)"/gi;
const bodies = [];
while ((m = handlerRe.exec(html))) bodies.push(m[1]);

const fnCallRe = /([A-Za-z_$][\w$.]*)\s*\(/g;
const missing = new Set();
const skip = new Set(['return', 'false', 'true', 'if', 'event', 'this', 'window', 'history', 'alert', 'confirm']);

bodies.forEach((body) => {
    let fm;
    while ((fm = fnCallRe.exec(body))) {
        const full = fm[1];
        const top = full.split('.')[0];
        if (skip.has(top)) continue;
        if (full.startsWith('Namvio')) {
            const parts = full.split('.');
            let obj = window;
            for (const p of parts) obj = obj && obj[p];
            if (typeof obj !== 'function') missing.add(full);
            continue;
        }
        if (top === 'history') continue;
        if (typeof window[top] !== 'function') missing.add(full);
    }
});

const list = [...missing].sort();
const namvioBootErrors = bootErrors.filter((e) => /Namvio:/i.test(e));
console.log(JSON.stringify({ handlerCalls: bodies.length, missing: list, bootErrors: namvioBootErrors }, null, 2));
process.exit(list.length || namvioBootErrors.length ? 1 : 0);