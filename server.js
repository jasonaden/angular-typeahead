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

  res.jsonp({matching_items: searchArray.length, results: searchArray.slice(start,end)});
});

app.get('/campaigns', function(req, res) {
  var offset = req.query.offset || 0,
      limit = req.query.limit || 10;

  var start = offset * limit;
  var end = start + parseInt(limit,10);

  res.jsonp({matching_items: campaignsArray.length, results: campaignsArray.slice(start,end)});
});

app.listen(3000);