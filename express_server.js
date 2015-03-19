var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var basicAuth = require('basic-auth-connect');
var MongoClient = require('mongodb').MongoClient;
var options = {
  host:' 127.0.0.1',
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.crt')
};
var auth = basicAuth(function(user, pass) {
  return((user === 'cs360')&&(pass === 'test'));
});
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
//app.get('/', function (req, res) {
//  res.send("Get Index");
//});
app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.use(bodyParser.json());
app.get('/getcity', function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var json = [];
  console.log("In getcity");
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
});
app.get('/comment', function (req, res) {
  console.log("In comment route");
  MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if(err) throw err;
    db.collection("comments", function(err, comments){
      if(err) throw err;
      comments.find(function(err, items){
        items.toArray(function(err, itemArr){
          console.log("Document Array: ");
          console.log(itemArr);
          res.writeHead(200);
//          res.json(itemArr);
          res.end(JSON.stringify(itemArr));
        });
      });
    });
  });
});
app.post('/comment', auth, function (req, res) {
  console.log("In post route");
    // Now put it into the database
    console.log(req.remoteUser);
    console.log(req.body);
    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
      if(err) throw err;
      db.collection('comments').insert(req.body,function(err, records) {
        console.log("Record added as "+records[0]._id);
      });
    });
    res.writeHead(200);
    res.end("")
});
