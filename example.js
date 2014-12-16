
var Keycloak = require('connect-keycloak');

var express = require('express');
var session = require('express-session')

var app = express();
app.set('port', Number(process.argv[2]) );

app.use( session({
  secret: 'aaslkdhlkhsd',
  resave: false,
  saveUninitialized: true,
} ))

var keycloak = new Keycloak();
keycloak.loadConfig();

app.use( keycloak.middleware( {
  type: 'session',
  logout: '/logout',
  admin: '/',
} ));


app.get( '/', function(req,resp) {
  resp.send( "Howdy!" );
} )

app.get( '/:page', keycloak.protect(), function(req,resp) {
  resp.send( 'Page: ' + req.params.page + '<br><a href="/logout">logout</a>');
} );

var server = app.listen(app.settings.port, function () {
  keycloak.register();
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
