import puppeteer from 'puppeteer';

(async () => /* switch: { "-lib": ["dom"] } */ {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.evaluate(() => /* switch: { "-types": ["node"] } */ {
    process.stdout.write(document.title);
  });
  await browser.close();
})();
