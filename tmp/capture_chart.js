// Playwright TradingView chart capture
const { chromium } = require('playwright');

(async () => {
  console.log('Launching Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  console.log('Navigating to TradingView (operator chart with 4H interval)...');
  try {
    await page.goto('https://kr.tradingview.com/chart/acSRIq7A/?symbol=OKX%3ABTCUSDT&interval=240', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    console.log('Page loaded');
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  // 차트 렌더링 대기
  console.log('Waiting for chart render (20s)...');
  await page.waitForTimeout(20000);

  // 팝업 / 모달 닫기 시도
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {}

  // 4H 인터벌 강제 변경 (TradingView 단축키: 숫자 입력 후 Enter)
  console.log('Setting interval to 4H...');
  try {
    // TradingView 단축키: 240 + Enter = 240 minutes (4H)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.type('240');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
  } catch (e) {
    console.log('Interval change error:', e.message);
  }

  // 스크린샷 저장 (4H 변경 후)
  const screenshotPath = 'C:/project/btc-system/tmp/chart_screenshot.png';
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });

  console.log('Screenshot saved:', screenshotPath);

  // 페이지 타이틀 확인
  const title = await page.title();
  console.log('Page title:', title);

  // URL 확인
  const url = page.url();
  console.log('Final URL:', url);

  await browser.close();
  console.log('Done');
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
