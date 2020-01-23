import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const title = await page.evaluate(() => {
    return document.title;
  });
  console.log(title);
  await browser.close();
})();
