define(function () {
  'use strict';

  /**
   * Creates a 3D viewport with predefined settings and units
   * @param {Object} Renderer - The Bimplus Renderer module
   * @returns {Object} The created Viewport3D instance
   */
  function createViewport(Renderer) {
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

      // Enable usage of frame selecton
      //   BlueBlue:    (LEFT  MOUSE BUTTON) + SHIFT key
      //   GreenGreen:  (LEFT  MOUSE BUTTON) + CTRL key
      //                (RIGHT MOUSE BUTTON) + CTRL key
      useFrameSelection: true,
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
    const newViewport = new Renderer.Viewport3D({
      settings: settings,
      units: units,
      domElementId: "mainViewportContainer",
      name: "mainRendererViewport",
      GPUPick: true,
    });
    console.debug("Renderer created with settings:", newViewport);
    return newViewport;
  }

  /**
   * Appends model list items to the project UI and handles model loading/unloading
   * @param {Object} project - The project containing models
   * @param {Object} dependencies - Object containing required dependencies
   * @param {Object} dependencies.viewer - The project viewer instance
   * @param {Object} dependencies.viewport3D - The 3D viewport instance
   * @param {Object} dependencies.sectionCutLogic - The section cut logic instance
   * @param {Object} dependencies.settingsManager - The settings manager instance
   */
  function appendModelsOfProject(project, dependencies) {
    const { viewer, viewport3D, sectionCutLogic, settingsManager } = dependencies;
    
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
        settingsManager.getDefaultSettings();

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

          viewport3D.draw();
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
  }

  /**
   * Registers all event listeners for the renderer application
   * @param {Object} dependencies - Object containing required dependencies
   * @param {string} dependencies.environment - The environment string for navigation
   * @param {Object} dependencies.commandManager - The command manager instance
   * @param {Object} dependencies.settingsManager - The settings manager instance
   * @param {Object} dependencies.sectionCutLogic - The section cut logic instance
   * @param {Object} dependencies.viewport3D - The 3D viewport instance
   * @param {Object} dependencies.objectProperties - The object properties instance
   * @param {string} dependencies.currentTeam - The current team ID
   * @param {string} dependencies.currentProject - The current project ID
   */
  function registerEventListener(dependencies) {
    const { 
      environment, 
      commandManager, 
      settingsManager, 
      sectionCutLogic, 
      viewport3D, 
      objectProperties, 
      currentTeam, 
      currentProject 
    } = dependencies;

    $("#open-project-selection").click(function () {
      // Back to the project selection
      window.location.href = "/projects.html?env=" + environment;
    });

    $("#menuViewResetView").click(function () {
      commandManager.camera.resetView();
    });

    $("#menuViewFrontView").click(function () {
      commandManager.camera.frontView();
    });

    $("#menuViewTopView").click(function () {
      commandManager.camera.topView();
    });

    $("#menuViewSideView").click(function () {
      commandManager.camera.sideView();
    });

    $("#menuViewPerspectiveView").click(function () {
      commandManager.camera.perspectiveView();
    });

    $("#menuIsolateReset").click(function () {
      commandManager.isolation.resetSelectionMode();
    });

    $("#menuIsolateIsolate").click(function () {
      commandManager.isolation.isolate();
    });

    $("#menuIsolateClippingBox").click(function () {
      commandManager.isolation.isolateClippingBox();
    });

    $("#menuIsolateHide").click(function () {
      commandManager.isolation.isolateHide();
    });

    $("#menuColorAllObjectsInGreen").click(function () {
      commandManager.color.setAllObjectsToGreen();
    });

    $("#menuColorAllObjectsInBlue").click(function () {
      commandManager.color.setAllObjectsToBlue();
    });

    $("#menuResetColorOfAllObjects").click(function () {
      commandManager.color.resetColorForAllObjects();
    });

    $("#menuSectionReset").click(function () {
      commandManager.sections.resetSections();
    });

    $("#menuSectionX").click(function () {
      commandManager.sections.sectionX();
    });

    $("#menuSectionY").click(function () {
      commandManager.sections.sectionZ();
    });

    $("#menuSectionZ").click(function () {
      commandManager.sections.sectionY();
    });

    $("#menuSectionFree").click(function () {
      commandManager.sections.sectionFree();
    });

    $("#menuUseSinglePlane").click(function () {
      commandManager.sections.useSinglePlane();
    });

    $("#menuUseParallelPlanes").click(function () {
      commandManager.sections.useParallelPlanes();
    });

    $("#menuUseBox").click(function () {
      commandManager.sections.useBox();
    });

    $("#menuUseTranslationControl").click(function () {
      commandManager.sections.useTranslationControl();
    });

    $("#menuUseScaleControl").click(function () {
      commandManager.sections.useScaleControl();
    });

    $("#menuUseRotationControl").click(function () {
      commandManager.sections.useRotationControl();
    });

    $("#menuToggleControlVisibility").click(function () {
      commandManager.sections.toggleControlVisibility();
    });

    $("#menuFlipPlane").click(function () {
      commandManager.sections.flipClippingPlane();
    });

    $("#menuNextDemoSectionCutSettings").click(function () {
      sectionCutLogic.simulateSectionCutSettingsChange();
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    });

    $("#menuZoomTo").click(function () {
      commandManager.navigation.centerObjects();
    });

    $("#menuToggleAmbientOcclusion").click(function () {
      settingsManager.toggleAmbientOcclusion();
    });

    $("#menuToggleShadows").click(function () {
      settingsManager.toggleShadows();
    });

    $("#menuToggleLightColor").click(function () {
      settingsManager.toggleLightColor();
    });

    $("#menuToggleAmbientLightColor").click(function () {
      settingsManager.toggleAmbientLightColor();
    });

    $("#icon-toggle-hide").click(function () {
      commandManager.visibility.toggleHideObject(this.checked);
    });

    $("#icon-toggle-camera-type").click(function () {
      commandManager.camera.toggleCameraType();
    });

    $("#menuResetHiddenObjects").click(function () {
      commandManager.visibility.resetHiddenObjects();
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
  }

  // Return the utility functions for AMD
  return {
    createViewport: createViewport,
    appendModelsOfProject: appendModelsOfProject,
    registerEventListener: registerEventListener
  };
});