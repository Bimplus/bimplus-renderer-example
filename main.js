define(function (require) {

    // Load websdk
    var WebSdk = require('bimplus/websdk');

    // Use environment dev,stage or prod
    var environment = "stage";

    // Initalize api wrapper
    var api = new WebSdk.Api(WebSdk.createDefaultConfig(environment));

    $( "#loginButton" ).click(function( event ) {

        var user = $( "#user" ).val();
        var password = $( "#password" ).val();

        // Make authorization request to Bimplus, providing user name, password and application id
        api.authorize.post(user,password, 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX').done(function(data,status,xhr) {
            window.location.href = "/projects.html?token="+data.access_token;
        }).fail(function(data) {
            // Authorization failed
            alert("Login to Bimplus failed!");
        });
    });    
});
