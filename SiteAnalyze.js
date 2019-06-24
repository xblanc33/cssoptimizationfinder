const puppeteer = require('puppeteer');

// (async () => {
//     let result = await run('https://www.office.com/');
//     console.log(JSON.stringify(result));
// })();

async function run(url) {
    const nbOfRun = 10;
    const browser = await puppeteer.launch({headless:false});
    let timeSec = 0;
    let timeNanoSec = 0;
    let nbOfCDN = 0;
    let nbOfCSS = 0;
    let lengthOfCSS = 0;
    for (let index = 0; index < nbOfRun ; index++) {
        let res = await performOneRunAnalysisPromize(browser, url);
        timeSec = timeSec + res.time[0];
        timeNanoSec = timeNanoSec + res.time[1];
        nbOfCDN = res.nbOfCDN;
        nbOfCSS = res.nbOfCSS;
        lengthOfCSS = res.lengthOfCSS;
    }
    let timeNano = timeSec*Math.pow(10,9) + timeNanoSec;
    let timeMilli = timeNano / 1000000;
    let result = {
        avgTime : timeMilli / nbOfRun,
        nbOfRun : nbOfRun,
        nbOfCSS : nbOfCSS,
        lengthOfCSS : lengthOfCSS,
        nbOfCDN : nbOfCDN
    };
    browser.close();
    return result;    
}

function performOneRunAnalysisPromize(browser, url) {
    return new Promise( (res, rej) => {
        performOneRunAnalysis(browser, url, res, rej);
    });
}

function performOneRunAnalysis(browser, url, ok, err) {
    let result = {
        time : 0,
        nbOfCDN : 0,
        nbOfCSS : 0,
        lengthOfCSS : 0
    };
    browser.newPage()
    .then( page => {
        let responseListener = createResponseListener(result);
        let loadListener = createLoadListener(page, result, ok);

        page.on('response', responseListener);
        page.on('load', loadListener);

        result.time = process.hrtime();
        page.goto(url).catch(()=> {err();});
    })
    .catch(exception => {
        err();
    });
}


function createResponseListener (result) {
    return function (interceptedResponse) {
        let contentType = interceptedResponse.headers()["content-type"];
        let lengthOfCSS = parseInt(interceptedResponse.headers()["content-length"]);
        let isCSS = contentType === "text/css";
        if (isCSS) {
            result.nbOfCSS = result.nbOfCSS + 1;
            if (! isNaN(lengthOfCSS) ) {
                result.lengthOfCSS = lengthOfCSS + result.lengthOfCSS;
            }
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


module.exports = run;

