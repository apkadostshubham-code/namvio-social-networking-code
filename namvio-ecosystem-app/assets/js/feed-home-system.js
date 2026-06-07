/**
 * Namvio Feed Home — hero stats & composer sync for the homepage.
 */
(function () {
    function formatRep(n) {
        const v = Number(n) || 0;
        if (v >= 10000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
        return String(v);
    }

    function countTrending() {
        if (typeof window.TRENDING_KEYWORDS !== 'undefined' && window.TRENDING_KEYWORDS.length) {
            return window.TRENDING_KEYWORDS.length;
        }
        const rows = document.querySelectorAll('.trending-keyword-row');
        return rows.length || 12;
    }

    function refreshStats() {
        const postsEl = document.getElementById('nv-feed-stat-posts');
        const trendEl = document.getElementById('nv-feed-stat-trending');
        const repEl = document.getElementById('nv-feed-stat-rep');
        if (!postsEl && !trendEl && !repEl) return;

        const session = window.activeSessionState || {};
        const seed = (window.SEED_POSTS || []).length;
        const user = (session.posts || []).length;
        if (postsEl) postsEl.textContent = String(seed + user);
        if (trendEl) trendEl.textContent = String(countTrending());
        if (repEl) repEl.textContent = formatRep(session.reputationScore || 0);
    }

    function syncComposerAvatar() {
        const img = document.getElementById('feed-composer-avatar');
        const sidebarImg = document.getElementById('sidebar-avatar-img');
        const src =
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
        if (img && sidebarImg && sidebarImg.src) img.src = sidebarImg.src;
        else if (img) img.src = src;
    }

    function init() {
        refreshStats();
        syncComposerAvatar();
        if (window.NamvioMotion) {
            const hero = document.getElementById('nv-feed-hero');
            if (hero) window.NamvioMotion.revealNow(hero);
            const composer = document.querySelector('.nv-feed-composer');
            if (composer) window.NamvioMotion.revealNow(composer);
        }
    }

    window.NamvioFeedHome = { init, refreshStats, syncComposerAvatar };
})();