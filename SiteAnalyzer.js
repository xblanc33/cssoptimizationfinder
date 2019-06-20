const puppeteer = require('puppeteer');

(async () => {
    let result = await run('https://www.office.com/');
    console.log(JSON.stringify(result));
    let timeNano = result.timeSec*Math.pow(10,9) + result.timeNanoSec;
    let timeMilli = timeNano / 1000000;
    console.log(timeMilli);
})();

async function run(url) {
    try {
        const nbOfRun = 20;
        const browser = await puppeteer.launch();
        let timeSec = 0;
        let timeNanoSec = 0;
        let nbOfCDN = 0;
        let nbOfCSS = 0;
        for (let index = 0; index < nbOfRun ; index++) {
            let res = await performOneRunAnalysisPromize(browser, url);
            timeSec = timeSec + res.time[0];
            timeNanoSec = timeNanoSec + res.time[1];
            nbOfCDN = res.nbOfCDN;
            nbOfCSS = res.nbOfCSS;
        }
        let result = {
            timeSec : timeSec / nbOfRun,
            timeNanoSec : timeNanoSec / nbOfRun,
            nbOfCSS : nbOfCSS,
            nbOfCDN : nbOfCDN
        };
        browser.close();
        return result;
    } catch (exception) {
        console.log(exception);
    }
    
}

function performOneRunAnalysisPromize(browser, url) {
    return new Promise( (res, rej) => {
        performOneRunAnalysis(browser, url, res);
    });
}

function performOneRunAnalysis(browser, url, endCallBack) {
    let result = {
        time : 0,
        nbOfCDN : 0,
        nbOfCSS : 0
    };
    browser.newPage()
    .then( page => {
        let responseListener = createResponseListener(result);
        let loadListener = createLoadListener(page, result, endCallBack);

        page.on('response', responseListener);
        page.on('load', loadListener);

        result.time = process.hrtime();
        page.goto(url);
    })
    .catch(exception => {
        console.log(exception);
    });
}


function createResponseListener (result) {
    return function (interceptedResponse) {
        let contentType = interceptedResponse.headers()["content-type"];
        let isCSS = contentType === "text/css";
        if (isCSS) {
            result.nbOfCSS = result.nbOfCSS + 1;
        }
        let urlLowerCase = interceptedResponse.url().toLowerCase();
        let isCDN = urlLowerCase.includes('cdn');
        if (isCSS && isCDN) {
            result.nbOfCDN = result.nbOfCDN + 1;
        }
    }
}

function createLoadListener(page, result, endCallBack) {
    return function() {
        result.time = process.hrtime(result.time);
        endCallBack(result);
    }
}


