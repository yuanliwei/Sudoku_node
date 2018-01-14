var PORT = 3000;

const { exec } = require('child_process');
var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');
const qs = require('querystring');
var process = exec('adb shell')

var server = http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  switch (pathname) {
    case '/steps': return steps(request, response)
    case '/capture': return capture(request, response)
    case '/save': return save(request, response)
    default : return sendFile(pathname, response)
  }
});

function steps(req, resp) {
  var query = url.parse(req.url).query
  var stepstr = qs.parse(query).steps;
  var steps = JSON.parse(stepstr)
  for (var i = 0; i < steps.length; i++) {
    var p = steps[i]
    console.log(`input tap ${p.x} ${p.y}`);
    process.stdin.write(`input tap ${p.x} ${p.y}\n`)
  }
  resp.writeHead(200, { 'Content-Type': 'text/plain' });
  resp.write('ok');
  resp.end();

}

function capture(req, resp) {
  exec('adb shell screencap -p /mnt/sdcard/adb.png', (error, stdout, stderr) => {
    if (HTTP500(error, resp)) return
    exec('adb pull /sdcard/adb.png ./public/train_data/', (error, stdout, stderr) => {
      if (HTTP500(error, resp)) return
      sendFile('/train_data/adb.png', resp)
    });
  });
}

function save(req, resp) {
  var picPath = './public/train_data/adb.png'
  fs.exists(picPath, function (exists) {
    if (!exists) {
      resp.writeHead(404, { 'Content-Type': 'text/plain' });
      resp.write("This " + picPath + " was not found on this server.");
      resp.end();
    } else {
      fs.rename(picPath, `./public/train_data/error_${Date.now()}.png`)
      resp.writeHead(200, { 'Content-Type': 'text/plain' });
      resp.write(`error_${Date.now()}.png`);
      resp.end();
    }
  })
}

function sendFile(pathname, response) {
  // handle files
  pathname = pathname == '/' ? '/index.html' : pathname
  var realPath = path.join("public", pathname);
  var ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  fs.exists(realPath, function (exists) {
    if (!exists) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
    } else {
      fs.readFile(realPath, "binary", function (err, file) {
        if (HTTP500(err, response)) return
        var contentType = mine[ext] || "text/plain";
        response.writeHead(200, { 'Content-Type': contentType });
        response.write(file, "binary");
        response.end();
      });
    }
  });
}

function HTTP500(error, resp){
  if (!error) return false;
  console.error(error);
  resp.writeHead(500, { 'Content-Type': 'text/plain' });
  resp.write('error:'+error.stack);
  resp.end();
  return error;
}

var mine = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
}

server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");

exec('explorer "http://localhost:3000/"')
