define(function (require) {
  require("ie-array-find-polyfill");
  require("babel-polyfill");

  // Load Bimplus modules
  let WebSdk = require("bimplus/websdk");
  let Renderer = require("bimplus/renderer");
  let WebClient = require("bimplus/webclient");

  // Get values from URL
  let environment = WebClient.getUrlParameter("env");
  let token = WebClient.getUrlParameter("token");
  let currentTeam = WebClient.getUrlParameter("team");
  let currentProject = WebClient.getUrlParameter("project");

  // Initalize api wrapper
  let config = WebSdk.createDefaultConfig(environment);
  config.cache = true; // Override default value to use client side caching

  let api = new WebSdk.Api(config);
  api.setAccessToken(token);

  // Create the external client for communication with the bimplus controls
  let externalClient = new WebClient.ExternalClient("MyClient");

  // Create the proxy classes for explorer and portal, binding it to an exisiting iframe id
  let objectProperties = new WebClient.BimObjectProperties(
    "bimplusObjectProperties",
    api.getAccessToken(),
    externalClient,
    environment
  );

  let viewport3D = null;
  let sectionCutLogic = null;
  let viewer = null;

  let createViewport = () => {
    // Basic settings for the renderer viewport
    let settings = {
      defaultOpacity: 0.5,
      disciplineOpacity: 0.1,
      pinSizeScaleFactor: 2,
      maxWebGLBufferSize: 350e12,
      mixedModelMode: true,
      pinFlyToDistance: 20000,
      nearClippingPlane: 0.01,

      slideThmbSize: [180, 112],
    };

    let units = {
      weight: {
        multiplicator: 0.001,
        unit: "kg",
      },
      length: {
        multiplicator: 0.001,
        unit: "m",
      },
      width: {
        multiplicator: 0.001,
        unit: "m",
      },
      height: {
        multiplicator: 0.001,
        unit: "m",
      },
      area: {
        multiplicator: 0.000001,
        unit: "m²",
      },
      volume: {
        multiplicator: 1e-9,
        unit: "m³",
      },
    };

    // Create a viewport inside the given dom element
    return new Renderer.Viewport3D({
      settings: settings,
      units: units,
      domElementId: "mainViewportContainer",
      GPUPick: true,
    });
  };

  // ===============================================================
  // Set camera position
  // ===============================================================

  // Reset the current view and camera state
  let resetView = function () {
    viewport3D.resetSelectionMode();
    viewport3D.restoreViewbox();
    viewport3D.setRotationCenter(null);
  };

  // Set camera to front view
  let frontView = function () {
    viewport3D.setCameraResetAxis("x");
  };

  // Set camera to top view
  let topView = function () {
    viewport3D.setCameraResetAxis("y");
  };

  // Set camera to side view
  let sideView = function () {
    viewport3D.setCameraResetAxis("z");
  };

  // Set camera to pespective view
  let pespectiveView = function () {
    viewport3D.setCameraResetAxis("xyz");
  };

  // ===============================================================
  // Set object isolation
  // ===============================================================

  // Reset viewer selection mode
  let resetSelectionMode = function () {
    if (viewport3D.checkSelectionMode("hideIsolated") === true) {
      isolateHide(); // toggle isolateHide mode
    } else if (viewport3D.checkSelectionMode("clipIsolated") === true) {
      isolateClippingBox(); // toggle isolateClippingBox mode
    } else {
      isolate(); // toggle isolate mode
    }
  };

  // Switch on isolation mode - all other elements will be grey and transparent
  let isolate = function () {
    viewport3D.setSelectionMode("isolated");
  };

  // Switch on hidden isolation mode - all other elements will be hidden
  let isolateHide = function () {
    viewport3D.setSelectionMode("hideIsolated");
  };

  // Switch on clipping isolation mode - all elements outside the isolated elements
  // bounding box will be clipped
  let isolateClippingBox = function () {
    viewport3D.setSelectionMode("clipIsolated");
  };

  // ===============================================================
  // Colorize objects
  // ===============================================================

  let setAllObjectsToColor = function (color) {
    const objectIds = [];
    // Extract all object id's
    for (let obj of viewport3D.getObjectsContainer().getObjectsArray()) {
      objectIds.push(obj.id);
    }
    viewport3D.colorizeObjects(objectIds, color);
    viewport3D.draw();
  };
  let setAllObjectsToGreen = function () {
    setAllObjectsToColor("rgb(0,128,0)");
  };
  let setAllObjectsToBlue = function () {
    setAllObjectsToColor("rgb(0,0,255)");
  };
  let resetColorForAllObjects = function () {
    viewport3D.resetColoredObjects();
    viewport3D.draw();
  };

  // ===============================================================
  // Clipping planes / section cuts
  // ===============================================================

  let resetSections = function () {
    if (viewport3D.checkSelectionMode("section") === true) {
      viewport3D.setSelectionMode("section");
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }
  };

  let useXPlaneAsDefault = function () {
    if (viewport3D.checkSelectionMode("section") === false) {
      viewport3D.setSectionAxis("x");
    }
    if (viewport3D.checkSelectionMode("section") === false) {
      viewport3D.setSelectionMode("section");
    }
  };

  // Set section plane to x axis
  let sectionX = function () {
    viewport3D.setSectionAxis("x");
    if (viewport3D.checkSelectionMode("section") === false) {
      viewport3D.setSelectionMode("section");
    }
    viewport3D.clippingPlanes.onRefreshSectionCuts();
  };

  // Set section plane to y axis
  let sectionY = function () {
    viewport3D.setSectionAxis("y");
    if (viewport3D.checkSelectionMode("section") === false) {
      viewport3D.setSelectionMode("section");
    }
    viewport3D.clippingPlanes.onRefreshSectionCuts();
  };

  // Set section plane to z axis
  let sectionZ = function () {
    viewport3D.setSectionAxis("z");
    if (viewport3D.checkSelectionMode("section") === false) {
      viewport3D.setSelectionMode("section");
    }
    viewport3D.clippingPlanes.onRefreshSectionCuts();
  };

  // Set section plane to free axis - interactive selection of plane will be started
  let sectionFree = function () {
    viewport3D.setSectionAxis("Free");
    viewport3D.clippingPlanes.onRefreshSectionCuts();
  };

  // Turn on single plane
  let useSinglePlane = function () {
    useXPlaneAsDefault();
    viewport3D.setSinglePlaneMode();
    viewport3D.clippingPlanes.updateClippingPlanes();
    sectionCutLogic.refreshSectionCuts();
  };
  // Turn on parallel planes
  let useParallelPlanes = function () {
    useXPlaneAsDefault();
    viewport3D.setParallelPlaneMode();
    viewport3D.clippingPlanes.updateClippingPlanes();
    sectionCutLogic.refreshSectionCuts();
  };
  // Turn on box planes
  let useBox = function () {
    useXPlaneAsDefault();
    viewport3D.setBoxPlaneMode();
    viewport3D.clippingPlanes.updateClippingPlanes();
    sectionCutLogic.refreshSectionCuts();
  };

  // Turn on translation control
  let useTranslationControl = function () {
    useXPlaneAsDefault();
    viewport3D.useTranslationForTransformControls();
    sectionCutLogic.refreshSectionCuts();
  };
  // Turn on scaling control
  let useScaleControl = function () {
    useXPlaneAsDefault();
    viewport3D.useScaleForTransformControls();
    sectionCutLogic.refreshSectionCuts();
  };
  // Turn on rotation control
  let useRotationControl = function () {
    useXPlaneAsDefault();
    viewport3D.useRotationForTransformControls();
    sectionCutLogic.refreshSectionCuts();
  };
  // Toggle visibility of transfrom controls
  let toggleControlVisibility = function () {
    useXPlaneAsDefault();
    viewport3D.switchVisibilityOfTransformControls(true);
  };

  // Flip the clipping plane
  let flipClippingPlane = function () {
    useXPlaneAsDefault();
    viewport3D.flipOrientation();
    viewport3D.emptySectionCutSceneForSectionCutGeometry();
    viewport3D.clippingPlanes.onRefreshSectionCuts();
  };

  // ===============================================================
  // Hidding objects
  // ===============================================================

  // Switch on and off the hide mode in viewer. If this is enabled then clicking an object will hide it.
  let toggleHideObject = function (value) {
    if (value === true) {
      viewport3D.setSelectionMode("hidden");
    } else {
      viewport3D.unsetSelectionMode("hidden");
    }
  };
  let resetHiddenObjects = function (value) {
    viewport3D.resetHiddenObjects();
    viewport3D.draw();
  };
  // ===============================================================
  // Zoom to the selected objects
  // ===============================================================
  let centerObjects = function () {
    let selectedObjects = viewport3D.objectSets.selectedObjects.map((obj) => {
      return obj.id;
    });
    viewport3D.centerObjects(selectedObjects);
    console.debug("Center viewport for selected objects");
    if (selectedObjects.length == 0) {
      alert("Center function needs at least one selected object");
    }
  };

  // ===============================================================
  // Renderer settings
  // ===============================================================
  let getDefaultSettings = function () {
    let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
    viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
  };

  let toggleAmbientOcclusion = function () {
    let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
    console.debug(
      "Viewport ambient occlusion options",
      viewportOcclusionOptions
    );
    viewportOcclusionOptions.usage = !viewportOcclusionOptions.usage;
    viewportOcclusionOptions.usageForInteraction =
      !viewportOcclusionOptions.usageForInteraction;
    viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
    viewport3D.draw();
  };
  let toggleShadows = function () {
    let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
    console.debug(
      "Viewport ambient occlusion options",
      viewportOcclusionOptions
    );
    viewportOcclusionOptions.useShadows = !viewportOcclusionOptions.useShadows;
    viewportOcclusionOptions.useShadowsForInteraction =
      !viewportOcclusionOptions.useShadowsForInteraction;
    viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
    viewport3D.draw();
  };
  let toggleLightColor = function () {
    let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
    console.debug(
      "Viewport ambient occlusion options",
      viewportOcclusionOptions
    );

    // Switch from white light color to red
    if (viewportOcclusionOptions.lightColor.g === 1.0) {
      viewportOcclusionOptions.lightColor.g = 0.0;
    } else {
      viewportOcclusionOptions.lightColor.g = 1.0;
    }

    if (viewportOcclusionOptions.lightColor.b === 1.0) {
      viewportOcclusionOptions.lightColor.b = 0.0;
    } else {
      viewportOcclusionOptions.lightColor.b = 1.0;
    }

    viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
    viewport3D.draw();
  };
  let toggleAmbientLightColor = function () {
    let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
    console.debug(
      "Viewport ambient occlusion options",
      viewportOcclusionOptions
    );

    // Switch from white light color to red
    if (viewportOcclusionOptions.ambientLightColor.g === 0.6) {
      viewportOcclusionOptions.ambientLightColor.g = 1.0;
    } else {
      viewportOcclusionOptions.ambientLightColor.g = 0.6;
    }

    if (viewportOcclusionOptions.ambientLightColor.b === 0.6) {
      viewportOcclusionOptions.ambientLightColor.b = 0.0;
    } else {
      viewportOcclusionOptions.ambientLightColor.b = 0.6;
    }

    viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
    viewport3D.draw();
  };

  // Register event handlers
  let registerEventListener = () => {
    $("#open-project-selection").click(function () {
      // Back to the project selection
      window.location.href = "/projects.html?token=" + token;
    });

    $("#menuViewResetView").click(function () {
      resetView();
    });

    $("#menuViewFrontView").click(function () {
      frontView();
    });

    $("#menuViewTopView").click(function () {
      topView();
    });

    $("#menuViewSideView").click(function () {
      sideView();
    });

    $("#menuViewPerspectiveView").click(function () {
      pespectiveView();
    });

    $("#menuIsolateReset").click(function () {
      resetSelectionMode();
    });

    $("#menuIsolateIsolate").click(function () {
      isolate();
    });

    $("#menuIsolateClippingBox").click(function () {
      isolateClippingBox();
    });

    $("#menuIsolateHide").click(function () {
      isolateHide();
    });

    $("#menuColorAllObjectsInGreen").click(function () {
      setAllObjectsToGreen();
    });

    $("#menuColorAllObjectsInBlue").click(function () {
      setAllObjectsToBlue();
    });

    $("#menuResetColorOfAllObjects").click(function () {
      resetColorForAllObjects();
    });

    $("#menuSectionReset").click(function () {
      resetSections();
    });

    $("#menuSectionX").click(function () {
      sectionX();
    });

    $("#menuSectionY").click(function () {
      sectionZ();
    });

    $("#menuSectionZ").click(function () {
      sectionY();
    });

    $("#menuSectionFree").click(function () {
      sectionFree();
    });

    $("#menuUseSinglePlane").click(function () {
      useSinglePlane();
    });

    $("#menuUseParallelPlanes").click(function () {
      useParallelPlanes();
    });

    $("#menuUseBox").click(function () {
      useBox();
    });

    $("#menuUseTranslationControl").click(function () {
      useTranslationControl();
    });

    $("#menuUseScaleControl").click(function () {
      useScaleControl();
    });

    $("#menuUseRotationControl").click(function () {
      useRotationControl();
    });

    $("#menuToggleControlVisibility").click(function () {
      toggleControlVisibility();
    });

    $("#menuFlipPlane").click(function () {
      flipClippingPlane();
    });

    $("#menuNextDemoSectionCutSettings").click(function () {
      sectionCutLogic.simulateSectionCutSettingsChange();
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    });

    $("#menuZoomTo").click(function () {
      centerObjects();
    });

    $("#menuToggleAmbientOcclusion").click(function () {
      toggleAmbientOcclusion();
    });

    $("#menuToggleShadows").click(function () {
      toggleShadows();
    });

    $("#menuToggleLightColor").click(function () {
      toggleLightColor();
    });

    $("#menuToggleAmbientLightColor").click(function () {
      toggleAmbientLightColor();
    });

    $("#icon-toggle-hide").click(function () {
      toggleHideObject(this.checked);
    });

    $("#menuResetHiddenObjects").click(function () {
      resetHiddenObjects();
    });

    // This is required to update the viewer matrices properly
    window.addEventListener(
      "resize",
      function () {
        viewport3D.setViewportSize();
      },
      false
    );

    window.addEventListener("keydown", (event) => {
      console.debug(`Keydown event code=${event.code} key=${event.key}`);

      if (event.isComposing || event.keyCode === 229) {
        return;
      } else if (event.key === "Escape") {
        viewport3D.escapeKeyPressed();
      }
    });

    // Handle the selected3DObject event
    $(viewport3D.domElement).on("select3DObject", function (e, param) {
      // Try to get the selected object on top of the selection stack
      let selectedObject =
        viewport3D.objectSets.selectedObjects.length > 0
          ? viewport3D.objectSets.selectedObjects[
              viewport3D.objectSets.selectedObjects.length - 1
            ]
          : undefined;

      // If object is selected open the object properties for this object
      if (selectedObject?.id) {
        objectProperties.load(currentTeam, currentProject, selectedObject.id);
        $("#objectProperties").fadeIn();
      } else {
        $("#objectProperties").fadeOut();
      }
      console.log("Renderer example - selected object:", selectedObject);
    });
  };

  let appendModelsOfProject = (project) => {
    // Load all models found inside the project
    let models = project.getModels();

    // Create DOM object string to be appended by jquery
    // This is the representation of a model in left panel
    let createModelListItem = function (model) {
      return (
        "" +
        '<li class="mdl-list__item">' +
        '  <span class="mdl-list__item-secondary-action" title="Switch model visibility">' +
        '    <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect"' +
        'for="list-switch-' +
        model.id +
        '">' +
        '      <input type="checkbox" id="list-switch-' +
        model.id +
        '" class="mdl-switch__input"/>' +
        "    </label>" +
        "  </span>" +
        '  <span class="mdl-list__item-primary-content" title="' +
        model.name +
        '">' +
        model.name +
        "  </span>" +
        "</li>"
      );
    };

    // Loop through all project models and create the list items for the left menu
    models.forEach(function (model) {
      // Append item to the models list
      $(createModelListItem(model)).appendTo("#modelsList");

      // Register toggle event for the corresponding model
      $("#list-switch-" + model.id).click(async function () {
        // Get settings defaults from Renderer
        getDefaultSettings();

        // Counter of active loading requests - used to switch the spinner on or off
        let loadingCount = 0;

        if (this.checked) {
          loadingCount++;

          $("#spinner").css("display", "flex");

          // Trigger model loading for the currenly selected model
          // If model has already been loaded this call does nothing.
          // If it hasn't been loaded yet it loads all topology nodes with all disciplines of this model
          model.setCurrentRevision(model.getLatestRevision());
          await viewer.loadModelStructure(model);
          let mvs = viewer.getModelViewState(model.id);
          mvs.setLayersVisible(true);
          mvs.setLeafNodesVisible(true);
          await viewer.setModelViewState(mvs);

          // Set model visible after finished loading from server
          // model.setVisible(true);
          sectionCutLogic.refreshSectionCuts();

          // Hide spinner in case of all load requests have been finished
          loadingCount--;
          if (loadingCount === 0) {
            $("#spinner").css("display", "none");
            viewport3D.setupProjectView();
          }
        } else {
          // Hide model
          model.setVisible(false);
          sectionCutLogic.refreshSectionCuts();
        }
      });
    });

    // This is required to update the DOM elements which where added dynamically.
    // See https://stackoverflow.com/questions/34579700/material-design-lite-js-not-applied-to-dynamically-loaded-html-file
    if (typeof componentHandler != "undefined") {
      componentHandler.upgradeAllRegistered();
    }
  };

  class SectionCuts {
    constructor(api, Renderer, project, viewport3D, sectionCutsLoader) {
      this.api = api;
      this.viewport3D = viewport3D;
      this.project = project;
      this.Renderer = Renderer;
      this.simulationStep = 0;
      this.sectionCutsLoader = sectionCutsLoader;
    }

    registerSectionCutListener() {
      let self = this;

      // Event emitted when an object is hidden from the renderer
      mainViewportContainer.addEventListener("onHidingObject", function () {
        sectionCutLogic.loadSectionCuts(
          self.project,
          viewport3D.clippingPlanes.getSectionCutOptions()
        );
      });

      // Event emitted when flip button is pressed
      mainViewportContainer.addEventListener(
        "onSectionFlipPlaneClicked",
        function () {
          viewport3D.clippingPlanes.flipOrientation();
          sectionCutLogic.loadSectionCuts(
            self.project,
            viewport3D.clippingPlanes.getSectionCutOptions(),
            false /* update of planes not needed */
          );
        }
      );

      // Event emitted when settings button is pressed
      mainViewportContainer.addEventListener(
        "onSectionSettingsClicked",
        function () {
          sectionCutLogic.loadSectionCuts(
            self.project,
            simulateSectionCutSettingsChange()
          );
        }
      );

      // Event emitted when refresh of section cuts is needed
      mainViewportContainer.addEventListener(
        "onRefreshSectionCuts",
        function () {
          sectionCutLogic.loadSectionCuts(
            self.project,
            viewport3D.clippingPlanes.getSectionCutOptions()
          );
        }
      );

      // Event emitted when free plane was selected in renderer
      mainViewportContainer.addEventListener(
        "onFreePlaneSelected",
        function () {
          viewport3D.unsetSelectionMode("section");
          viewport3D.unsetSelectionMode("selectSectionPlane");
          viewport3D.setSelectionMode("section");

          sectionCutLogic.loadSectionCuts(
            self.project,
            viewport3D.clippingPlanes.getSectionCutOptions()
          );
        }
      );
    }

    // simulate different section cut settings
    refreshSectionCuts() {
      viewport3D.clippingPlanes.onRefreshSectionCuts();
      viewport3D.draw();
    }

    // simulate different section cut settings
    simulateSectionCutSettingsChange() {
      let settings = viewport3D.clippingPlanes.getSectionCutOptions();
      viewport3D.clippingPlanes.storeClippingPlane();

      if (this.simulationStep === 0) {
        // use no section cuts
        this.simulationStep++;
        settings.showFaces = false;
        settings.showEdges = false;
      } else if (this.simulationStep === 1) {
        // use object values for section faces
        this.simulationStep++;
        settings.showFaces = true;
        settings.showEdges = false;
        settings.useObjectColorAndOpacity = true;
      } else if (this.simulationStep === 2) {
        // use object values for section faces
        this.simulationStep++;
        settings.showFaces = true;
        settings.showEdges = true;
        settings.useObjectColorAndOpacity = true;
        settings.edgeColor = new Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 1;
        settings.edgeThickness = 30; // 3cm
      } else if (this.simulationStep === 3) {
        // use section edges
        this.simulationStep++;
        settings.showFaces = false;
        settings.showEdges = true;
        settings.useObjectColorAndOpacity = false;
        settings.edgeColor = new Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 0.8;
        settings.edgeThickness = 60; // 6cm
      } else if (this.simulationStep === 4) {
        // use section faces with defined color
        this.simulationStep++;
        settings.showFaces = true;
        settings.showEdges = false;
        settings.useObjectColorAndOpacity = false;
        settings.faceColor = new Renderer.THREE.Color("rgb(0,250,0)");
        settings.faceOpacity = 0.2;
      } else {
        // use section faces and edge
        this.simulationStep = 0;
        settings.showFaces = true;
        settings.showEdges = true;
        settings.useObjectColorAndOpacity = false;
        settings.faceColor = new Renderer.THREE.Color("rgb(0,0,250)");
        settings.faceOpacity = 0.2;
        settings.edgeColor = new Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 1;
        settings.edgeThickness = 60; // 6cm
      }

      viewport3D.clippingPlanes.setSectionCutOptions(settings);
      return settings;
    }

    loadSectionCuts(projectId, currentSettings, withUpdate = true) {
      let self = this;
      let calculateCutSection = async function () {
        if (settings.showFaces || settings.showEdges) {
          try {
            // console.debug("RendererProject, Viewport", currentProject, viewport3D)
            await self.sectionCutsLoader.loadSectionCuts(
              self.project,
              viewport3D,
              false,
              settings
            );
          } finally {
            console.debug("Calculate section cuts done");
          }
        }
      };

      let settings = currentSettings;

      calculateCutSection();
    }
  }

  // First we need to get the teamslug for the corresponding team id.
  // Therefore we get all of the users teams and search for the id.
  api.teams.get().done(async function (teams) {
    let team = teams.find(function (t) {
      return t.id === currentTeam;
    });

    // Go back to projects page if no corresponding team has been found
    if (!team) {
      alert("Team not found!");
      window.location.href = "/projects.html?token=" + token;
    }

    // Set current teamslug
    api.setTeamSlug(team.slug);

    viewport3D = createViewport();

    registerEventListener();

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
    sectionCutLogic = new SectionCuts(
      api,
      Renderer,
      project,
      viewport3D,
      sectionCutsLoader
    );
    sectionCutLogic.registerSectionCutListener();

    appendModelsOfProject(project);
  });
});
