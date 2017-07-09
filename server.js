// server.js
// where your node app starts

// init project
var express = require('express');
var mongo = require('mongodb').MongoClient;
var isUri = require('valid-url').isUri;
var app = express();
var links;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

mongo.connect(process.env.BASE, function(err, db) {
              if (err) throw err;
              links = db.collection("links");
              });

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
// we cannot put a request parameter like this "/new/:term" so we will use this form
app.get(/new\/(.+)/, function (request, response) {
  if(isUri(request.params[0])){
    links.find({original_url:request.params[0]}).toArray(function(err,docs){
      if(err)throw err;
      if(docs.length>0){
        //if(docs.length>1)throw new Error('Multiple ids.');
        response.send({original_url:request.params[0], short_url:"https://"+request.headers.host+"/"+docs[0].id});
      }
      else{
        links.count({},function(err,count){
          if(err)throw err;
          links.insert({original_url:request.params[0], id:count},function(err,data){
            if(err)throw err;
            response.send({original_url:data.ops[0].original_url, short_url:"https://"+request.headers.host+"/"+data.ops[0].id});
          });
        });
      }
    });
  }
  else{
    response.send({error:"Wrong url format."});
  }
});

app.get("/:id", function (request, response) {
  var id = +request.params.id;
  if(isNaN(id))response.send({error:"invalid url"});
  else{
    links.find({id:id}).toArray(function(err,docs){
      if(err)throw err;
      if(docs.length>0){
        if(docs.length>1)throw new Error('Multiple ids.');
        response.redirect(docs[0].original_url);
      }
      else{
        response.send({error:"This url is not on the database."});
      }
    });
  }
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
