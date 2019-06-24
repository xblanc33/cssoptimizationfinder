const puppeteer = require('puppeteer');
const fs = require('fs');

(async function() {
    const browser = await puppeteer.launch({headless:false});
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


    fs.writeFile('url.csv', urlTab.join('\n'), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
})();


