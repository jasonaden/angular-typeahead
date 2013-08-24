var express = require('express'),
    data = require('./testdata');

var app = express();
app.use(express.bodyParser());

var searchArray = data.searchArray;
var campaignsArray = data.campaignsArray;

app.get('/search', function(req, res) {
  var offset = req.query.offset || 0,
      limit = req.query.limit || 10;

  var start = offset * limit;
  var end = start + parseInt(limit,10);

  setTimeout(function () {
    res.jsonp({matching_items: searchArray.length, results: searchArray.slice(start,end)});
  }, 1500)
});

app.get('/campaigns', function(req, res) {
  var offset = req.query.offset || 0,
      limit = req.query.limit || 10;

  var start = offset * limit;
  var end = start + parseInt(limit,10);

  setTimeout(function () {
      return res.jsonp({matching_items: campaignsArray.length, results: campaignsArray.slice(start,end)});
  }, Math.floor((Math.random()*5)+1)*1000)
});

app.listen(3000);