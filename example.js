
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


// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

var keycloak = new Keycloak({
  store: memoryStore
});

// Install the Keycloak middleware.
//
// Specifies that the user-accessible application URL to
// logout should be mounted at /logout
//
// Specifies that Keycloak console callbacks should target the
// root URL.  Various permutations, such as /k_logout will ultimately
// be appended to the admin URL.

app.use( keycloak.middleware( {
  logout: '/logout',
  admin: '/',
} ));


app.get( '/', function(req,resp) {
  resp.send( "Howdy!" );
} )


/*
app.get( '/roles', keycloak.protect(), function(req,resp) {
  keycloak.admin(resp.locals.token).getApplicationRoles(function(data) {
    resp.send( JSON.stringify( data ) );
  })
})
*/


// A guard can take up to 3 arguments, and is passed
// the access_token, the HTTP request and the HTTP response.
//
// The token can be tested for roles:
//
// * 'foo' is a simple application role 'foo' for the current application
// * 'bar:foo' is an application role 'foo' for the application 'bar'
// * 'realm:foo' is a realm role 'foo' for the application's realm

var groupGuard = function(token, req, resp) {
  return token.hasRole( req.params.group );
}

// The keycloak.protect(...) function can take a guard function to perform
// advanced protection of a URL.
//
// Additionally (not shown) it can take simple string role specifier identical
// to those used above by token.hasRole(...).

app.get( '/:group/:page', keycloak.protect( groupGuard ), function(req,resp) {
  resp.send( 'Page: ' + req.params.page + ' for Group: ' + req.params.group + '<br><a href="/logout">logout</a>');
})

// A simple keycloak.protect() ensures that a user is authenticated
// but provides no additional RBAC protection.

app.get( '/:page', keycloak.protect(), function(req,resp) {
  resp.send( 'Page: ' + req.params.page + '<br><a href="/logout">logout</a>');
} );

var server = app.listen(app.settings.port, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})
