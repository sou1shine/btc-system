/* ============================================================
   BTC System - Unified Navigation Loader
   목적: 모든 페이지의 nav를 단일 소스로 통일 관리
   - JavaScript로 nav HTML 직접 삽입 (fetch ❌ / CORS ❌)
   - 현재 페이지 자동 active 강조
   - nav 변경 시 본 파일 한 곳만 수정
   사용: <div id="site-nav"></div> + <script defer src="nav-loader.js"></script>
   ============================================================ */

(function () {
  'use strict';

  // ─── 1) 통일 nav 정의 (모든 페이지 공통) ───
  const NAV_HTML = `
<nav class="nav">
  <div class="nav-inner">
    <a href="index.html" class="nav-home" data-page="index.html">🏠 BTC 시스템</a>
    <a href="btc-system-v3.html" data-page="btc-system-v3.html" data-primary="true">🚀 v3 룰북</a>
    <a href="btc-system-v3-card.html" data-page="btc-system-v3-card.html" data-primary="true">🎯 v3 실전 카드</a>
    <a href="btc-analysis.html" data-page="btc-analysis.html" data-primary="true">📈 분석</a>
    <a href="btc-real-candle.html" data-page="btc-real-candle.html" data-primary="true">📊 DB</a>
    <a href="btc-macro-learn.html" data-page="btc-macro-learn.html" data-primary="true">📖 매크로 학습</a>
    <a href="btc-3ai-archive.html" data-page="btc-3ai-archive.html">🤖 3-AI 누적</a>
    <a href="btc-closing-archive.html" data-page="btc-closing-archive.html">🎯 마감 누적</a>
    <a href="btc-trades.html" data-page="btc-trades.html">📚 트레이드</a>
    <a href="btc-reviews.html" data-page="btc-reviews.html">📚 외부 검토</a>
    <span class="nav-divider" aria-hidden="true">|</span>
    <a href="btc-system-v1.html" data-page="btc-system-v1.html" data-historical="true">🗂️ v1</a>
    <a href="btc-system-v2.html" data-page="btc-system-v2.html" data-historical="true">🗂️ v2</a>
    <a href="btc-market.html" data-page="btc-market.html" data-historical="true">🗂️ HA 시장</a>
  </div>
</nav>
`;

  // ─── 2) DOMContentLoaded 시 nav 삽입 ───
  function loadNav() {
    const placeholder = document.getElementById('site-nav');

    if (placeholder) {
      // <div id="site-nav"></div> 위치에 삽입 (replace)
      placeholder.outerHTML = NAV_HTML;
    } else {
      // placeholder 없으면 body 시작 위치에 삽입
      document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    }

    // ─── 3) 현재 페이지 자동 active 강조 ───
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav a[data-page]');

    links.forEach(a => {
      const page = a.getAttribute('data-page');

      // 정본 (data-primary) = 녹색 강조
      if (a.dataset.primary === 'true') {
        a.style.color = '#2e7d32';
        a.style.fontWeight = '600';
      }

      // Historical (data-historical) = 흐림 처리
      if (a.dataset.historical === 'true') {
        a.style.color = '#999';
        a.style.fontSize = '0.85em';
      }

      // 현재 페이지 = active 클래스
      if (page === path) {
        a.classList.add('nav-active');
      }
    });
  }

  // ─── 4) 실행 ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNav);
  } else {
    loadNav();
  }
})();
