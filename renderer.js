define(function (require) {

    require('ie-array-find-polyfill');
    require('babel-polyfill');
    
    // Load Bimplus modules
    var WebSdk = require('bimplus/websdk');
    var Renderer = require('bimplus/renderer');
    var WebClient = require('bimplus/webclient');

    // Use environment dev,stage or prod
    var environment = "stage";

    // Parse the query parameters
    var token = WebClient.getUrlParameter('token');
    var currentTeam = WebClient.getUrlParameter('team');
    var currentProject = WebClient.getUrlParameter('project');

    // Initalize api wrapper
    var api = new WebSdk.Api(WebSdk.createDefaultConfig(environment));
    api.setAccessToken(token);

    // Back to the project selection
    $("#buttonProjects").click(function(){ 
      window.location.href = "/projects.html?token="+token;
    });

        // Create the external client for communication with the bimplus controls
    var externalClient = new WebClient.ExternalClient("MyClient");

        // Create the proxy classes for explorer and portal, binding it to an exisiting iframe id
    var objectProperties = new WebClient.BimObjectProperties('bimplusObjectProperties',api.getAccessToken(),externalClient,environment);

    // First we need to get the teamslug for the corresponding team id.
    // Therefore we get all of the users teams and search for the id.
    api.teams.get().done(function(teams){
      
      var team = teams.find(function(t){
        return t.id === currentTeam;
      });

      // Go back to projects page if no corresponding team has been found
      if(!team){
        alert("Team not found!");
        window.location.href = "/projects.html?token="+token;
      }

      // Set current teamslug
      api.setTeamSlug(team.slug);

      // Basic settings for the renderer viewport
      var settings = {
        "defaultOpacity": 0.5,
        "disciplineOpacity": 0.1,
        "pinSizeScaleFactor": 2,
        "maxWebGLBufferSize": 350e12,
        "mixedModelMode": true,
        "pinFlyToDistance": 20000,
        "nearClippingPlane": 0.01,

        "slideThmbSize": [
          180,
          112
        ],
        "units": {
          "mm": {
            "weight": {
              "multiplicator": 0.001,
              "unit": "kg"
            },
            "length": {
              "multiplicator": 0.001,
              "unit": "m"
            },
            "width": {
              "multiplicator": 0.001,
              "unit": "m"
            },
            "height": {
              "multiplicator": 0.001,
              "unit": "m"
            },
            "area": {
              "multiplicator": 0.000001,
              "unit": "m²"
            },
            "volume": {
              "multiplicator": 1e-9,
              "unit": "m³"
            }
          },
          "inch": {}
        },

      }

      // Create a viewport inside the given dom element
      var viewport3D = new Renderer.Viewport3D({
          settings: settings,
          domElementId: "viewportDiv",
          GPUPick: true
      });

      // Handle the selected3DObject event
      $(viewport3D.domElement).on('select3DObject', function (e, param) {
        
        // Try to get the selected object on top of the selection stack
        var  selectedObject = viewport3D.objectSets.selectedObjects.length > 0 ? viewport3D.objectSets.selectedObjects[viewport3D.objectSets.selectedObjects.length-1] : undefined;
        
        // If object is selected open the object properties for this object
        if(selectedObject && selectedObject.id){
          objectProperties.load(currentTeam,currentProject,selectedObject.id);	
          $('#objectProperties').fadeIn();
        }else{
          $('#objectProperties').fadeOut();
        }
        console.log(selectedObject);
      });

      // Create a content loader for the viewport which is using the api for requests
      var loader = new Renderer.ContentLoader(api,viewport3D);
    
      // Load basic information of the project
		  loader.loadProject(currentProject).then(function(project){
        
        // Load all models found inside the project
        var models = project.getModels();
        var promises = [];
        models.forEach(function(model){
          promises.push(loader.loadModel(project,model));
        })

        // Disable the busy indicator when all promises are resolved
        Promise.all(promises).then(function(){
          $('#spinner').css("display", "none");
        })
      })
    })
});
