var express = require('express');

var app = express();
app.use(express.bodyParser());

var searchArray = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming','St. Catharines','Kapiti','Polpenazze del Garda','SantOmero','Newark','Stratford','New Sarepta','Lerwick','Campina Grande','Morrovalle','Landau','Gonnosnò','Prince Albert','Williams Lake','Forge-Philippe','Carleton','Shawville','Pelotas','Saint-Mard','Saint Andr','Hawera','Fusignano','Beringen','Ferrandina','Aliano','Toledo','Cavallino','Gateshead','Neunkirchen','Gravataí','Daly','Timaru','Glendon','Tavier','Delmenhorst','Evansville','Anlier','Bergisch Gladbach','Minto','Alva','Thunder Bay','100 Mile House','Worksop','Maglie','Caledon','San Vicente','Pitt Meadows','Dubbo','Caxias do Sul','Aurora','Sankt Wendel','Lac La Biche County','Alkmaar','Bruck an der Mur','Cropalati','Ludwigshafen','Campagna','Cisterna di Latina','Brye','Laval','Marbaix','Broxburn','Montpelier','Pironchamps','Acireale','Lutterworth','Rigolet','Rves','Milmort','Tourcoing','San Vicente','Lowestoft','Illkirch-Graffenstaden','Mansfield','Lampeter','Saarlouis','Nottingham','Saint-Hilarion','Lerwick','Cap-de-la-Madeleine','Sannazzaro de Burgondi','Soye','Montebello','Fredericton','Holman','Tulita','Patalillo','Osasco','San Pancrazio Salentino','Courcelles','Buti','Sint-Martens-Lennik','Fahler','Camrose','Mannheim','Priolo Gargallo','Carluke','Landau','Flawinne','Ururi'];

app.get('/search', function(req, res) {
  var offset = req.query.offset || 0,
      limit = req.query.limit || 10;

  var start = offset * limit;
  var end = start + parseInt(limit,10);

  res.jsonp({matching_items: searchArray.length, results: searchArray.slice(start,end)});
});

app.listen(3000);