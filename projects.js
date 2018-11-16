define(function (require) {

    // Load websdk
    var WebSdk = require('bimplus/websdk');

    // Load Renderer
    var Renderer = require('bimplus/renderer');

    // Load Client integration
    var WebClient = require('bimplus/webclient');

    // Use environment dev,stage or prod
    var environment = "stage";

    // Initalize api wrapper
    var api = new WebSdk.Api(WebSdk.createDefaultConfig(environment));

    // Get the token from the url paremter list
    var token = WebClient.getUrlParameter('token');

    var currentProject, currentTeam;

    // Set api token
    api.setAccessToken(token);
    
    // Create the external client for communication with the bimplus controls
    var externalClient = new WebClient.ExternalClient("MyClient");

    var projects = new WebClient.BimPortal('projects',api.getAccessToken(),externalClient,environment);

    // Initialize the client to listen for messages
    externalClient.initialize();

    // Add message handler for team changed event
    externalClient.addMessageHandler("TeamChanged",function(msg){
        currentTeam = msg.id;
    });

    // Add message handler for project selected event
    externalClient.addMessageHandler("ProjectSelected",function(msg){
        currentProject = msg.id;

        // Go to renderer page with token, team and project added as parameter
        window.location.href = "/renderer.html?token="+token+"&team="+currentTeam+"&project="+currentProject;        
    });
    
    // Load the project selection
    projects.load();
});
