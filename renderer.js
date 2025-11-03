define(function (require) {
  require("ie-array-find-polyfill");
  require("babel-polyfill");

  // Load modules
  let WebSdk = require("bimplus/websdk");
  let Renderer = require("bimplus/renderer");
  let WebClient = require("bimplus/webclient");
  let AllplanUserManager = require('allplanUserManager');
  let SectionCuts = require('SectionCuts');
  let utils = require('utils');
  let settings = require('settings');
  let commands = require('commands');

  // Get values from URL
  let environment = WebClient.getUrlParameter("env");
  let currentTeam = WebClient.getUrlParameter("team");
  let currentProject = WebClient.getUrlParameter("project");

  // Create the UserManager
  let userManager = AllplanUserManager.createUserManager(environment);

  // Initalize api wrapper
  let config = WebSdk.createDefaultConfig(environment);
  config.cache = true; // Override default value to use client side caching

  let api = new WebSdk.Api(config);

  // Create the external client for communication with the bimplus controls
  let externalClient = new WebClient.ExternalClient("MyClient");

  // Global variable declarations - these will be initialized during the async setup process
  let viewport3D = null;           // The main 3D viewport for rendering models and handling user interactions
  let sectionCutLogic = null;      // Handles section cutting functionality for 3D models
  let viewer = null;               // Project viewer instance for loading and managing project data
  let settingsManager = null;      // Manages renderer settings (ambient occlusion, shadows, lighting, etc.)
  let commandManager = null;       // Handles various renderer commands (camera, isolation, color manipulation)
  let objectProperties = null;     // Interface for displaying and managing object properties panel

  async function initializeRenderer() {
    let user = await userManager.getUser();
    if (!user || !user.access_token) {
      window.location.href = "/index.html"
    }

    api.setAccessToken(user.access_token);

    let teams = await api.teams.get();
    let team = teams.find(function (t) {
      return t.id === currentTeam;
    });

    // Go back to projects page if no corresponding team has been found
    if (!team) {
      alert("Team not found!");
      window.location.href = "/projects.html?env=" + environment;
    }

    // Set current teamslug
    api.setTeamSlug(team.slug);

    viewport3D = utils.createViewport(Renderer);

    // Initialize the settings manager with the viewport
    settingsManager = settings.createSettingsManager(viewport3D);

    // Get reference to threejs embeddded into bimplus-renderer
    // and create grid helper and append to renderer custom scene
    let THREE = Renderer.THREE;
    let gridHelper = new THREE.GridHelper(100000, 20);
    viewport3D.customScene.add(gridHelper);

    // Create a project viewer for the viewport which is using the api for requests
    viewer = new Renderer.ProjectViewer(api, viewport3D);

    // Load basic information of the project
    let project = await viewer.loadProject(currentProject);

    let sectionCutsLoader = new Renderer.SectionCutsLoader(api, viewport3D);
    let mainViewportContainer = document.getElementById("mainViewportContainer");
    sectionCutLogic = new SectionCuts(
      api,
      Renderer,
      project,
      viewport3D,
      sectionCutsLoader,
      mainViewportContainer
    );
    sectionCutLogic.registerSectionCutListener();

    // Initialize the command manager with required dependencies
    commandManager = commands.createCommandManager({
      viewport3D: viewport3D,
      sectionCutLogic: sectionCutLogic
    });

    // Create the proxy classes for explorer and portal, binding it to an exisiting iframe id
    objectProperties = new WebClient.BimObjectProperties(
      "bimplusObjectProperties",
      api.getAccessToken(),
      externalClient,
      environment
    );

    // Register event listeners using the utils module with dependency injection
    utils.registerEventListener({
      environment: environment,
      commandManager: commandManager,
      settingsManager: settingsManager,
      sectionCutLogic: sectionCutLogic,
      viewport3D: viewport3D,
      objectProperties: objectProperties,
      currentTeam: currentTeam,
      currentProject: currentProject
    });

    // Append models using the utils module with dependency injection
    utils.appendModelsOfProject(project, {
      viewer: viewer,
      viewport3D: viewport3D,
      sectionCutLogic: sectionCutLogic,
      settingsManager: settingsManager
    });

  }

  initializeRenderer();

});
