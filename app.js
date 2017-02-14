//  Required modules
var path = require('path');
var express = require('express');
var zipdb = require('zippity-do-dah');
var ForecastIo = require('forecastio');

//  Create an express app
//  Create a ForecastIO object with your API key
var app = express();
var weather = new ForecastIo("d353b6bd13ce9bcc8f5b562edaa18101");

//  Serves static files out of public
app.use(express.static(path.resolve(__dirname, 'public')));

//  Use EJS as the view engine
//  Serve the views out of a views folder
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

//  Renders the index view if you hit the homepage
app.get('/', function(req, res) {
  res.render('index');
});

//  Capture the specified ZIP Code and pass it as req.params[0]
//  Grabs location data with the Zip code (var location)
//  Returns {} when no results are found. Continues if the object isn't empty
app.get(/^\/(\d{5})$/, function(req, res, next) {
  var zipcode = req.params[0];
  var location = zipdb.zipcode(zipcode);
  if (!location.zipcode) {
    next();
    return;
  }

  var latitude = location.latitude;
  var longitude = location.longitude;

  weather.forecast(latitude, longitude, function(err, data) {
    if (err) {
      next();
      return;
    }

    res.json({
      zipcode: zipcode,
      temperature: data.currently.temperature
    });
  });
});

//  Shows a 404 error if no other routes are matched
app.use(function(req, res) {
  res.status(404).render('404');
});

//  Starts the app on port 3000
app.listen(3000);
