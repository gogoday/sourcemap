/**
 * usage: 
 * node handle.js 1 9999 http://11.url.cn/now/h5/record_8fb63a1.js?_bid=152
 *
 */

let argv = require('yargs')
  .usage('Usage: sourcemap [distFileUrl] [lineNum] [colNum] [sourceMapFilePath]')
  .example('sourcemap http://11.url.cn/now/h5/record_6327cb5.js?_bid=152 1 999 /Users/sampsonwang/workspace/now-h5-record/sourcemap', '')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2018')
  .argv;

let http = require('http');
let fs = require('fs')
let SourceMapConsumer = require('source-map').SourceMapConsumer
let exec = require('child_process').exec

const args = argv._

let distFileUrl = args[0] || 0   //
let lineNum = args[1] || 0
let colNum = args[2] || ''
let sourceMapFilePath = args[3] || ''

const readline = require('readline');

const data = {
    minFilePath: 'http://11.url.cn/now/h5/record_6327cb5.js?_bid=152',
    lineNum: 10,
    colNum: 780,
    sourceFilePath: '/Users/sampsonwang/workspace/now-h5-record/sourcemap'
}

data.minFilePath = distFileUrl;
data.lineNum = lineNum;
data.colNum =  colNum;
data.sourceFilePath = sourceMapFilePath;


// main fun
// get min file 
getMinFile(data.minFilePath, data.lineNum, (currentLine) => {
    // get a line by line num
    // console.log('line content get success! ');
    // get source file by line defile 
    getSourceMapPath(currentLine, (sourcePath) => {
        // handle sourceMap
        getSourceMap(sourcePath, (mapJson, mapObj) => {
            getSourcePosition(mapJson, mapObj);
        });
    })
});

function getSourcePosition(mapJson, mapObj) {
    const source = mapObj.sourcesContent[0];
    let line = mapJson.line;
    const column = mapJson.column;

    const sourceByLine = source.split('\n');

    // 实际检测 line = line -1;
    line -= 1;

    console.log("");
    console.log('===============info=================')
    console.log(`source path: ${data.sourceFilePath.replace('sourcemap', 'src') + mapJson.source}`)
    console.log(`line: ${line}`)
    console.log(`column: ${mapJson.column}`)
    console.log(`name: ${mapJson.name}`)
    console.log('===============detail===============')


    sourceByLine.forEach((item, l) => {
        item = l + item;
        if (l === line) {
          console.log("\x1b[31m", item);
        } else if (l > line - 10 && l < line + 10) {
          console.log("\x1b[37m", item);
        }
    })
    console.log('================end================')

}

function getSourceMap(sourcePath, cb) {
    let content = fs.readFileSync(sourcePath, 'utf-8');
    content = JSON.parse(content);
    // console.log(content);
    SourceMapConsumer.with(content, null, consumer => {

        const mapJson = consumer.originalPositionFor({
            line: 1,
            column: data.colNum
        })

        cb(mapJson, content);
    })

}

function getSourceMapPath(lineContent, cb) {
    // define("node_modules/@tencent/now-base-menu/lib/index"
    var m = lineContent.match(/^define\("([^"]+)"/);
    var path = data.sourceFilePath;
    if (m) {
        path += '/' + m[1];
        cb(path + '.js.map');
    }
}



function getMinFile(url, lineNum, cb) {
    const req = http.get(url);

    req.on('response', income => {

        const rl = readline.createInterface({
            input: income,
            crlfDelay: Infinity
        });

        let i = 1;
        rl.on('line', (line) => {
            if (i == lineNum) {
                // console.log(line.slice(0, 100));
                cb(line);
            } else {
                // console.log(line.slice(0, 100));
            }
            i ++;
        });
    })

}


