const puppeteer = require('puppeteer');
let time;

function logRequest(interceptedRequest) {
    console.log('A request was made:', interceptedRequest.url());
}

function logResponse(interceptedResponse) {
    let contentType = interceptedResponse.headers()["content-type"];
    let isCSS = contentType === "text/css";
    if (isCSS) {
        console.log('CSS');
    }
    let urlLowerCase = interceptedResponse.url().toLowerCase();
    let isCDN = urlLowerCase.includes('cdn');
    if (isCSS && isCDN) {
        console.log('CDN');
    }
}

function logLoad() {
    time = process.hrtime(time);
    console.log(`time: ${time}`);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('response', logResponse);
  page.on('load', logLoad);
  time = process.hrtime();
  await page.goto('https://www.office.com/');

  await browser.close();
})();