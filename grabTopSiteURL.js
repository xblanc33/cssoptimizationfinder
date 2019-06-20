const puppeteer = require('puppeteer');

(async function() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.alexa.com/topsites");

    

    let urlTab = await page.$$eval('.DescriptionCell', descriptionCellArray => {
        let urlTab = [];
        descriptionCellArray.forEach(cell => {
            urlTab.push(`https://www.${cell.firstElementChild.innerText.toLowerCase()}`);
        });
        return urlTab;
    });

    browser.close();

    console.log(urlTab);
})();


