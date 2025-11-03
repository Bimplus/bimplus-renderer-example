define(function (require) {

  let AllplanUserManager = require('allplanUserManager');

  // Load websdk
  let WebSdk = require("bimplus/websdk");

  // Load Client integration
  let WebClient = require("bimplus/webclient");

    // Use environment dev,stage or prod
  let environment = WebClient.getUrlParameter("env");

  let userManager = AllplanUserManager.createUserManager(environment);

  // Initalize api wrapper
  let api = new WebSdk.Api(WebSdk.createDefaultConfig(environment));

  let startProjectSelection = function() {
    let currentProject;
    let currentTeam;

    // Create the external client for communication with the bimplus controls
    let externalClient = new WebClient.ExternalClient("MyClient");

    let projects = new WebClient.BimPortal(
      "projects",
      api.getAccessToken(),
      externalClient,
      environment
    );

    // Initialize the client to listen for messages
    externalClient.initialize();

    projects.onTeamChanged = (teamId) => {
      currentTeam = teamId;
      console.debug("onTeamChanged newTeam = " + teamId);
    };

    projects.onProjectSelected = (prjId) => {
      currentProject = prjId;
      console.debug("onProjectSelected newProjectId = " + prjId);
      window.location.href =
        "/renderer.html" +
        "?env=" +
        environment +
        "&team=" +
        currentTeam +
        "&project=" +
        currentProject;
    };

    // Load the project selection
    projects.load();
  }

   userManager.getUser().then(function(user) {
    console.log("Current user:", user);
      if(!user || !user.access_token){
        window.location.href = "/index.html"
      }

      let token = user.access_token
      api.setAccessToken(token);

      startProjectSelection();
    });

  
});
