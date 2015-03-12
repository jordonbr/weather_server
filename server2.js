var fs = require('fs');
var http = require('http');
var url = require('url');
var ROOT_DIR = "html/";
var PORT = process.argv[2];

http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  console.log(urlObj.pathname);
  console.log(urlObj.pathname.indexOf("comment"));
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
  } else if(urlObj.pathname.indexOf("comment") != -1) { //NEW ROUTE
      if(req.method === "POST") {
        console.log("POST comment route");      
        // First read the form data
        var jsonData = "";
        req.on('data', function (chunk) {
          jsonData += chunk;
        });
        req.on('end', function () {
          var reqObj = JSON.parse(jsonData);
          console.log(reqObj);
          console.log("Name: "+reqObj.Name);
          console.log("Comment: "+reqObj.Comment);        
          // Now put it into the database
          var MongoClient = require('mongodb').MongoClient;
          MongoClient.connect("mongodb://localhost/weather", function(err, db) {
            if(err) throw err;
            db.collection('comments').insert(reqObj,function(err, records) {
              console.log("Record added as "+records[0]._id);
            });
          });
          res.writeHead(200);
          res.end("")
        });
      }else if(req.method === "GET") {
        console.log("In GET"); 
        // Read all of the database entries and return them in a JSON array
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
          if(err) throw err;
          db.collection("comments", function(err, comments){
            if(err) throw err;
            comments.find(function(err, items){
              items.toArray(function(err, itemArr){
                console.log("Document Array: ");
                console.log(itemArr);
                res.writeHead(200);
                res.end(JSON.stringify(itemArr));
              });
            });
          });
        });
      }
      
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



