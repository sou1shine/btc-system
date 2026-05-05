// Playwright TradingView with Indicators + Data Window
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

  console.log('Navigating to TradingView 4H chart...');
  await page.goto('https://www.tradingview.com/chart/?symbol=OKX%3ABTCUSDT&interval=240', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('Waiting initial render (15s)...');
  await page.waitForTimeout(15000);

  // ESC로 팝업 닫기
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // 1. RSI Indicator 추가 시도
  console.log('Adding RSI indicator...');
  try {
    // Indicators 버튼 클릭 (상단)
    await page.keyboard.press('/');  // TradingView shortcut: open indicators
    await page.waitForTimeout(2000);

    // RSI 입력
    await page.keyboard.type('Relative Strength Index');
    await page.waitForTimeout(2000);

    // 첫 번째 결과 클릭
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // 모달 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('RSI add error:', e.message);
  }

  // 2. EMA Indicator 추가 시도
  console.log('Adding EMA indicator...');
  try {
    await page.keyboard.press('/');
    await page.waitForTimeout(2000);

    await page.keyboard.type('Moving Average Exponential');
    await page.waitForTimeout(2000);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('EMA add error:', e.message);
  }

  // 3. Volume MA Indicator 추가 시도
  console.log('Adding Volume MA indicator...');
  try {
    await page.keyboard.press('/');
    await page.waitForTimeout(2000);

    await page.keyboard.type('Moving Average');
    await page.waitForTimeout(2000);

    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('Volume MA add error:', e.message);
  }

  // 4. Data Window 활성화 시도 (Alt+D)
  console.log('Opening Data Window...');
  try {
    await page.keyboard.press('Alt+d');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Data Window error:', e.message);
  }

  // 마지막 캔들로 마우스 이동 (오른쪽)
  console.log('Hover over latest candle...');
  await page.mouse.move(1450, 400);
  await page.waitForTimeout(2000);

  // 스크린샷 저장
  const screenshotPath = 'C:/project/btc-system/tmp/chart_v2_screenshot.png';
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });
  console.log('Screenshot saved:', screenshotPath);

  await browser.close();
  console.log('Done');
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
