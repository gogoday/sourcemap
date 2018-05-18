/**
 * usage: 
 * node handle.js 1 9999 http://11.url.cn/now/h5/record_8fb63a1.js?_bid=152
 *
 */

let argv = require('yargs')
  .usage('Usage: badjsmap [lineNum] [colNum] [minFile]')
  .example('badjsmap 1 9999 jquery.min.js', '')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2018')
  .argv;

let http = require('http');
let fs = require('fs')
let readline = require('readline');
let SourceMapConsumer = require('source-map').SourceMapConsumer
let exec = require('child_process').exec

let lineno = process.argv[2] || 0   //
let columnno = process.argv[3] || 0
let fileName = process.argv[4] || ''

const data = {
    minFilePath: '',
    minFile: '',
    currentLine: '',
    lineNum: 0,
    sourceFilePath: '/Users/sampsonwang/workspace/now-h5-record/sourcemap',
    outPut: '',
    colNum: 0

}


// get min file 
getMinFile(data.minFilePath, (minFile) => {
    console.log('minFile get success! ');
    // get a line by line num
    getCurrentLine(d1.minFile, data.lineNum, (currentLine) => {
        console.log('line content get success! ');
        // get source file by line defile 
        getSourceMap(currentLine, (sourcePath) => {
            // handle sourceMap
            getSourceMap(sourcePath, d => {
                console.log(d)
            });
        })
    })
});

function getSourceMap(sourcePath, cb) {
    SourceMapConsumer.with(require(sourcePath), null, consumer => {
        console.log(consumer.sources);
        // [ 'http://example.com/www/js/one.js',
        //   'http://example.com/www/js/two.js' ]

        console.log(consumer.originalPositionFor({
            line: 2,
            column: 28
        }));
    })

}

function getSourceMap(lineContent, cb) {
    // define("node_modules/@tencent/now-base-menu/lib/index"
    var m = lineContent.match(/^define\("([^"]+)"/);
    var path = data.sourceFilePath;
    if (m) {
        path += '/' + m[1];
        console.log(`sourceMap file path is : ${path}`);
        cb(path);
    }
}

function getCurrentLine(minFile, lineNum, cb) {
    let fileArr = minFile.split(/\n/);
    cb(fileArr[lineNum]);
}


function getMinFile(url, cb) {
    http.get(url, res => {
        res.setEncoding('utf8');
        let content = '';
        res.on('data', chunk=> {
            content += chunk;
        });
        res.on('end', data => {
            cb(content);
        })
    })
}


// console.log(argv);

// 读取压缩文件 获取 map文件地址
http.get(fileName, res => {
    res.setEncoding('utf8');
    let content = '';
    res.on('data', chunk=> {
        content += chunk;
    });
    res.on('end', data => {
        getSourceFile(getMapUrl(content));
    })
})

function getMapUrl(content) {
    
    // console.log(content);
    let arr, l, match, mapUrl;
    arr = content.split(/[\r\n]/)
    l = arr.length - 1;
    while (l > 0 && arr[l] === '') {
        match = arr[l].match(/^\/\/@\ssourceMappingURL\=(.*)$/);
        if (match && match.length > 1) {
            mapUrl = match[1];
            l = -1
        } else {
            l --
        }
    }
    if (mapUrl) {
        console.log(mapUrl);
    } else {
        console.log('don\'t get sourcemap url');
    }
    return mapUrl;
}

function getSourceFile(mapFile) {
     mapFile = '/Users/sampsonwang/workspace/badjs-sourcemap/jquery.min.js.map';
    if (!mapFile) {
        return;
    }

    exec('node build onlineMap', function () {
         var consumer = new SourceMapConsumer(fs.readFileSync(mapFile, 'utf8'))

          let pos = consumer.originalPositionFor({
            line: +lineno,
            column: +columnno
          })
          // console.log(pos);

          console.log(`file path: ${pos.source}`)
          console.log(`lineNum: ${pos.line}`)
          console.log(`colNum: ${pos.column}`)
          console.log(`name: ${pos.name}`)

          rl = readline.createInterface({
              input: fs.createReadStream(pos.source),
              ourput: process.stdout
          });

          let lineNum = 1;
          rl.on('line', data => {
                  data = lineNum + data;
              if (lineNum === pos.line) {
                  console.log("\x1b[31m", data);
              } else if (lineNum > pos.line - 10 && lineNum < pos.line + 10) {
                  console.log("\x1b[37m", data);
              }

              lineNum ++;
          })

          /*
           *{ source: 'file:///E:/workspace/test/sourcemap/jquery.js',
              line: 1267,
              column: 69,
              name: 'promise' }
           * */
          

    })
}
