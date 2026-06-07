/**
 * Run full verification suite — exit 1 on any failure.
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const scripts = [
    'verify-boot.js',
    'verify-guide.js',
    'verify-html.js',
    'verify-systems.js',
    'verify-handlers.js',
    'verify-website.js',
    'verify-jun5-full.js',
    'verify-sidebar.js',
    'verify-restore.js',
    'check-dup-ids.js'
];

let failed = 0;
for (const name of scripts) {
    process.stdout.write('--- ' + name + ' ---\n');
    try {
        execSync('node "' + path.join(__dirname, name) + '"', { cwd: ROOT, stdio: 'inherit' });
    } catch (_) {
        failed += 1;
    }
}

console.log(failed ? '\nFAILED ' + failed + ' check(s)' : '\nALL CHECKS PASSED');
process.exit(failed ? 1 : 0);