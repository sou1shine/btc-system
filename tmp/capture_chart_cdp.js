// Playwright CDP - 운영자 Chrome 디버그 모드 연결
const { chromium } = require('playwright');

(async () => {
  console.log('Connecting to operator Chrome (CDP port 9222)...');

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('✅ Connected to operator Chrome');
  } catch (e) {
    console.error('❌ Failed to connect:', e.message);
    console.error('Make sure Chrome is started with: --remote-debugging-port=9222');
    process.exit(1);
  }

  // 운영자 사용자 컨텍스트 (첫 번째)
  const contexts = browser.contexts();
  console.log(`Found ${contexts.length} context(s)`);

  if (contexts.length === 0) {
    console.error('❌ No browser context found');
    await browser.close();
    process.exit(1);
  }

  const context = contexts[0];

  // 기존 페이지들 확인
  const pages = context.pages();
  console.log(`Found ${pages.length} page(s) in context`);

  let page;
  let foundExistingChart = false;

  // TradingView 차트가 이미 열려 있는지 확인
  for (const p of pages) {
    const url = p.url();
    console.log(`  - Page URL: ${url.substring(0, 80)}...`);
    if (url.includes('tradingview.com/chart/acSRIq7A')) {
      page = p;
      foundExistingChart = true;
      console.log('✅ Using existing TradingView chart tab');
      break;
    }
  }

  // 기존 차트 없으면 새 페이지 생성
  if (!page) {
    console.log('Opening new tab with TradingView chart...');
    page = await context.newPage();
    await page.goto('https://kr.tradingview.com/chart/acSRIq7A/?symbol=OKX:BTCUSDT&interval=240', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
  } else {
    // 기존 페이지 활성화
    await page.bringToFront();
  }

  console.log('Waiting for chart render (15s)...');
  await page.waitForTimeout(15000);

  // 페이지 정보 확인
  const title = await page.title();
  const currentUrl = page.url();
  console.log('Page title:', title);
  console.log('Current URL:', currentUrl);

  // 스크린샷 저장
  const screenshotPath = 'C:/project/btc-system/tmp/chart_cdp.png';
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });
  console.log('✅ Screenshot saved:', screenshotPath);

  // 브라우저 연결 종료 (브라우저 자체는 닫지 않음 / 운영자 사용 중)
  console.log('Disconnecting (Chrome stays open)...');
  await browser.close();
  console.log('Done');
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
