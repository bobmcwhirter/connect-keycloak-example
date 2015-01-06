
var Keycloak = require('../connect-keycloak');

var express = require('express');
var session = require('express-session')

var app = express();

var p = 3000;
if ( process.argv.length >= 3 ) {
  p = Number( process.argv[2] );
}

app.set('port', p );

var memoryStore = new session.MemoryStore();

app.use( session({
  secret: 'aaslkdhlkhsd',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
} ))

var keycloak = new Keycloak({
  store: memoryStore
});

app.use( function(req,resp,next) {
  console.log( req.url );
  next();
})

app.use( keycloak.middleware( {
  logout: '/logout',
  admin: '/',
} ));


app.get( '/', function(req,resp) {
  resp.send( "Howdy!" );
} )

app.get( '/roles', keycloak.protect(), function(req,resp) {
  keycloak.admin(resp.locals.token).getApplicationRoles(function(data) {
    resp.send( JSON.stringify( data ) );
  })
})


var groupGuard = function(token, req, resp) {
  return token.hasRole( req.params.group );
}

app.get( '/:group/:page', keycloak.protect( groupGuard ), function(req,resp) {
  resp.send( 'Page: ' + req.params.page + ' for Group: ' + req.params.group + '<br><a href="/logout">logout</a>');
})

app.get( '/:page', keycloak.protect(), function(req,resp) {
  resp.send( 'Page: ' + req.params.page + '<br><a href="/logout">logout</a>');
} );

var server = app.listen(app.settings.port, function () {
  //keycloak.register();
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
