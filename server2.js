var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
var PORT = process.argv[2];

http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var json = [];
  if(urlObj.pathname.indexOf("getcity") != -1) {//NEW ROUTE
    fs.readFile('cities.dat.txt', function(err, data) {
      if(err) throw err;
      cities = data.toString().split("\n");
      var myRe = new RegExp("^" + urlObj.query['q']); 
      for(var i = 0; i < cities.length; i++) {
        var result = cities[i].search(myRe);
        if(result != -1){ 
          console.log(cities[i]);
          json.push({city:cities[i]});
        }
      }
      console.log(JSON.stringify(json));
      res.writeHead(200);
      res.end(JSON.stringify(json));
    });
    console.log("in getcity");
    console.log(urlObj);
  } else {
    fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      console.log(JSON.stringify(json));
      res.writeHead(200);
      res.end(data)
    });
  }
}).listen(PORT);



