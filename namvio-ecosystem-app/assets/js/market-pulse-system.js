/**
 * Namvio Market Pulse — dynamic KPIs & motion for insights page.
 */
(function () {
    function formatVol(n) {
        const v = Number(n) || 0;
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (v >= 1000) return '$' + Math.round(v / 1000) + 'k';
        return '$' + v.toLocaleString();
    }

    function getListingStats() {
        const list = window.NamvioListings && window.NamvioListings.LISTINGS ? window.NamvioListings.LISTINGS : [];
        const escrowVol = list.filter((l) => l.escrow).reduce((s, l) => s + (l.price || 0), 0);
        return { count: list.length, escrowVol };
    }

    function renderKpis() {
        const trending = (window.TRENDING_KEYWORDS || []).length || 10;
        const sales = (window.NAMEBIO_TOP_SALES || []).length || 100;
        const accounts = (window.SEED_ACCOUNTS || []).length || 12;
        const listings = getListingStats();
        const investors = (accounts * 1070 + 2840).toLocaleString();

        return `
<div class="col-6 col-md-3 mb-3 mb-md-0">
  <div class="mkt-kpi-card mkt-kpi-card--investors">
    <span class="mkt-kpi-value">${investors}</span>
    <span class="mkt-kpi-label"><i class="fa-solid fa-users mr-1"></i>Active investors</span>
  </div>
</div>
<div class="col-6 col-md-3 mb-3 mb-md-0">
  <div class="mkt-kpi-card mkt-kpi-card--primary">
    <span class="mkt-kpi-value">${listings.count}</span>
    <span class="mkt-kpi-label"><i class="fa-solid fa-store mr-1"></i>Live listings</span>
  </div>
</div>
<div class="col-6 col-md-3 mb-3 mb-md-0">
  <div class="mkt-kpi-card mkt-kpi-card--trending">
    <span class="mkt-kpi-value">${trending}</span>
    <span class="mkt-kpi-label"><i class="fa-solid fa-bolt mr-1"></i>Trending keywords</span>
  </div>
</div>
<div class="col-6 col-md-3">
  <div class="mkt-kpi-card mkt-kpi-card--success">
    <span class="mkt-kpi-value">${formatVol(listings.escrowVol || 4200000)}</span>
    <span class="mkt-kpi-label"><i class="fa-solid fa-shield-halved mr-1"></i>Escrow ask volume</span>
  </div>
</div>
<p class="mkt-kpi-foot text-muted mb-0 col-12"><i class="fa-solid fa-database mr-1"></i>${sales} reference sales in NameBio dataset (demo)</p>`;
    }

    function refreshKpis() {
        const row = document.getElementById('mkt-kpi-row');
        if (row) row.innerHTML = renderKpis();
    }

    function init() {
        refreshKpis();
        if (window.NamvioMotion) {
            const view = document.getElementById('view-market-pulse');
            window.NamvioMotion.scanReveal(view);
            if (view) {
                window.NamvioMotion.staggerChildren(view, '.mkt-kpi-card, .trending-keyword-row, .recent-sale-row');
            }
        }
    }

    window.NamvioMarketPulse = { init, refreshKpis, renderKpis };
})();