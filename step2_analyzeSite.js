const analyze = require('./SiteAnalyze.js');
const fs = require('fs');


(async function() {
    fs.readFile('url.csv', 'utf8' ,async (err, data) => {
        if (err) throw err;

        let resultTab = [];        
        let urlTab = data.split('\n');

        for (let index = 0; index < urlTab.length; index++) {
            const url = urlTab[index];
            console.log(`Analyzing ${url}`);
            try {
                let result = await analyze(url);
                result.url = url;
                resultTab.push(result);
                console.log(`result : ${JSON.stringify(result)}`);
            } catch (exception) {
                console.log(`Exception for ${url}`);
            }
        }

        let csv = resultTab.map(result => {
            return `${result.url} , ${result.avgTime}, ${result.nbOfCSS} , ${result.nbOfCSS}, ${result.lengthOfCSS}`;
        }).join('\n');
        fs.writeFile('result.csv', csv, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
    });
})();