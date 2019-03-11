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
    var config = WebSdk.createDefaultConfig(environment);
    config.cache = true; // Override default value to use client side caching

    var api = new WebSdk.Api(config);
    api.setAccessToken(token);

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

      // Reset the current view and camera state
      var resetView = function(){
        viewport3D.resetSelectionMode();
        viewport3D.restoreViewbox();
        viewport3D.setRotationCenter(null);
      }

      // Set camera to front view
      var frontView = function(){
        viewport3D.setCameraResetAxis('x');
      }

      // Set camera to top view
      var topView = function(){
        viewport3D.setCameraResetAxis('y');
      }

      // Set camera to side view
      var sideView = function(){
        viewport3D.setCameraResetAxis('z');
      }

      // Set camera to pespective view
      var pespectiveView = function(){
        viewport3D.setCameraResetAxis('xyz');
      }

      // Reset viewer selection mode
      var resetSelectionMode = function(){
        viewport3D.resetSelectionMode();
      }

      // Switch on isolation mode - all other elements will be grey and transparent
      var isolate = function(){
        viewport3D.setSelectionMode('isolated');
      }

      // Switch on hidden isolation mode - all other elements will be hidden
      var isolateHide = function(){
        viewport3D.setSelectionMode('hideIsolated');
      }

      // Switch on clipping isolation mode - all elements outside the isolated elements
      // bounding box will be clipped
      var isolateClippingBox = function(){
        viewport3D.setSelectionMode('clipIsolated');
      }

      // Set section plane to x axis
      var sectionX = function(){
        viewport3D.setSectionAxis('x');
        if(viewport3D.checkSelectionMode('section') === false){
          viewport3D.setSelectionMode('section');
        }        
      }

      // Set section plane to y axis
      var sectionY = function(){
        viewport3D.setSectionAxis('y');
        if(viewport3D.checkSelectionMode('section') === false){
          viewport3D.setSelectionMode('section');
        }        
      }

      // Set section plane to z axis
      var sectionZ = function(){
        viewport3D.setSectionAxis('z');
        if(viewport3D.checkSelectionMode('section') === false){
          viewport3D.setSelectionMode('section');
        }        
      }

      // Set section plane to free axis - interactive selection of plane will be started
      var sectionFree = function(){
        viewport3D.setSectionAxis('Free');
      }

      // Switch on and off the hide mode in viewer. If this is enabled then clicking an object will hide it.
      var toggleHideObject = function(value){
        if(value===true){
          viewport3D.setSelectionMode('hidden');
        }else{
          viewport3D.unsetSelectionMode('hidden');
        }        
      }

      // Zoom to the selected objects
      var centerObjects = function(){
        var  selectedObjects = viewport3D.objectSets.selectedObjects.map((obj)=>{
          return obj.id
        });
        viewport3D.centerObjects(selectedObjects);
      }


      // Register event handlers
      //------------------------
      
      $("#open-project-selection").click(function(){ 
        // Back to the project selection
        window.location.href = "/projects.html?token="+token;
      });

      $("#menuViewResetView").click(function(){ 
        resetView();
      });

      $("#menuViewFrontView").click(function(){ 
        frontView();
      });

      $("#menuViewTopView").click(function(){ 
        topView();
      });

      $("#menuViewSideView").click(function(){ 
        sideView();
      });

      $("#menuViewPerspectiveView").click(function(){ 
        pespectiveView();
      });

      $("#menuIsolateReset").click(function(){ 
        resetSelectionMode();
      });

      $("#menuIsolateIsolate").click(function(){ 
        isolate();
      });

      $("#menuIsolateClippingBox").click(function(){ 
        isolateClippingBox();
      });

      $("#menuIsolateHide").click(function(){ 
        isolateHide();
      });

      $("#menuSectionReset").click(function(){ 
        resetSelectionMode();
      });

      $("#menuSectionX").click(function(){ 
        sectionX();
      });

      $("#menuSectionY").click(function(){ 
        sectionY();
      });

      $("#menuSectionZ").click(function(){ 
        sectionZ();
      });

      $("#menuSectionFree").click(function(){ 
        sectionFree();
      });

      $("#menuZoomTo").click(function(){ 
        centerObjects();
      });

      $('#icon-toggle-hide').click(function() {
        toggleHideObject(this.checked);
      });

      // This is required to update the viewer matrices properly
      window.addEventListener( 'resize', function(){
        viewport3D.setViewportSize();
      }, false );


      // Get reference to threejs embeddded into bimplus-renderer
      var THREE = Renderer.THREE; 
      
      // create grid helper and append to renderer custom scene
      var gridHelper = new THREE.GridHelper( 10, 20 );
      viewport3D.customScene.add( gridHelper );
      

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

        // Create DOM object string to be appended by jquery
        // This is the representation of a model in left panel
        var createModelListItem = function(model){
          return'<li class="mdl-list__item"><span class="mdl-list__item-primary-content">'+model.name+'</span><span class="mdl-list__item-secondary-action"><label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="list-switch-'+model.id+'"><input type="checkbox" id="list-switch-'+model.id+'" class="mdl-switch__input"/></label></span></li>';
        };

        // Loop through all project models and create the list items for the left menu
        models.forEach(function(model){
          
          // Append item to the models list
          $(createModelListItem(model)).appendTo('#modelsList');

          // Register toggle event for the corresponding model
          $('#list-switch-'+model.id).click(function() {

            // Counter of active loading requests - used to switch the spinner on or off
            let loadingCount = 0;

            if(this.checked){

              loadingCount++;

              $('#spinner').css("display", "flex");

              // Trigger model loading for the currenly selected model
              // If model has already been loaded this call does nothing.
              // If it hasn't been loaded yet it loads all topology nodes with all disciplines of this model
              loader.loadModel(project,model).then(function(project){
                  // Set model visible after finished loading from server
                model.setVisible(true);

                // Hide spinner in case of all load requests have been finished
                loadingCount--;
                if(loadingCount===0){
                  $('#spinner').css("display", "none");
                }
              });
            }else{              
              // Hide model
              model.setVisible(false);
            }
            
          });    
        });

        // This is required to update the DOM elements which where added dynamically.
        // See https://stackoverflow.com/questions/34579700/material-design-lite-js-not-applied-to-dynamically-loaded-html-file
        if(!(typeof(componentHandler) == 'undefined')){
          componentHandler.upgradeAllRegistered();
        }
        
      })
    })
});
