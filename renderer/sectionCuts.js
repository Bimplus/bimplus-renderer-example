define(function () {
  'use strict';

  class SectionCuts {
    constructor(api, Renderer, project, viewport3D, sectionCutsLoader, mainViewportContainer) {
      this.api = api;
      this.viewport3D = viewport3D;
      this.project = project;
      this.Renderer = Renderer;
      this.simulationStep = 0;
      this.sectionCutsLoader = sectionCutsLoader;
      this.sectionCutsTurnedOn = false;
      this.mainViewportContainer = mainViewportContainer;
      this.sectionCutLogic = this; // Reference to self for event handlers
    }

    turnOffSectionCuts() {
      this.sectionCutsTurnedOn = false;
    }

    turnOnSectionCuts() {
      this.sectionCutsTurnedOn = true;
    }

    registerSectionCutListener() {
      let self = this;

      // Event emitted when an object is hidden from the renderer
      this.mainViewportContainer.addEventListener("onHidingObject", function () {
        self.sectionCutLogic.loadSectionCuts(
          self.project,
          self.viewport3D.clippingPlanes.getSectionCutOptions()
        );
      });

      // Event emitted when flip button is pressed
      this.mainViewportContainer.addEventListener(
        "onSectionFlipPlaneClicked",
        function () {
          self.viewport3D.clippingPlanes.flipOrientation();
          self.sectionCutLogic.loadSectionCuts(
            self.project,
            self.viewport3D.clippingPlanes.getSectionCutOptions(),
            false /* update of planes not needed */
          );
        }
      );

      // Event emitted when settings button is pressed
      this.mainViewportContainer.addEventListener(
        "onSectionSettingsClicked",
        function () {
          self.sectionCutLogic.loadSectionCuts(
            self.project,
            self.sectionCutLogic.simulateSectionCutSettingsChange()
          );
        }
      );

      // Event emitted when refresh of section cuts is needed
      this.mainViewportContainer.addEventListener(
        "onRefreshSectionCuts",
        function () {
          self.sectionCutLogic.loadSectionCuts(
            self.project,
            self.viewport3D.clippingPlanes.getSectionCutOptions()
          );
        }
      );

      // Event emitted when free plane was selected in renderer
      this.mainViewportContainer.addEventListener(
        "onFreePlaneSelected",
        function () {
          self.viewport3D.unsetSelectionMode("section");
          self.viewport3D.unsetSelectionMode("selectSectionPlane");
          self.viewport3D.setSelectionMode("section");

          self.sectionCutLogic.loadSectionCuts(
            self.project,
            self.viewport3D.clippingPlanes.getSectionCutOptions()
          );
        }
      );
    }

    // simulate different section cut settings
    refreshSectionCuts() {
      this.viewport3D.clippingPlanes.onRefreshSectionCuts();
      this.viewport3D.draw();
    }

    // simulate different section cut settings
    simulateSectionCutSettingsChange() {
      let settings = this.viewport3D.clippingPlanes.getSectionCutOptions();
      this.viewport3D.clippingPlanes.storeClippingPlane();

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
        settings.edgeColor = new this.Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 1;
        settings.edgeThickness = 30; // 3cm
      } else if (this.simulationStep === 3) {
        // use section edges
        this.simulationStep++;
        settings.showFaces = false;
        settings.showEdges = true;
        settings.useObjectColorAndOpacity = false;
        settings.edgeColor = new this.Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 0.8;
        settings.edgeThickness = 60; // 6cm
      } else if (this.simulationStep === 4) {
        // use section faces with defined color
        this.simulationStep++;
        settings.showFaces = true;
        settings.showEdges = false;
        settings.useObjectColorAndOpacity = false;
        settings.faceColor = new this.Renderer.THREE.Color("rgb(0,250,0)");
        settings.faceOpacity = 0.2;
      } else {
        // use section faces and edge
        this.simulationStep = 0;
        settings.showFaces = true;
        settings.showEdges = true;
        settings.useObjectColorAndOpacity = false;
        settings.faceColor = new this.Renderer.THREE.Color("rgb(0,0,250)");
        settings.faceOpacity = 0.2;
        settings.edgeColor = new this.Renderer.THREE.Color("rgb(5,0,5)");
        settings.edgeOpacity = 1;
        settings.edgeThickness = 60; // 6cm
      }

      this.viewport3D.clippingPlanes.setSectionCutOptions(settings);
      return settings;
    }

    loadSectionCuts(projectId, currentSettings, withUpdate = true) {
      let self = this;
      if (this.sectionCutsTurnedOn) {
        let calculateCutSection = async function () {
          if (settings.showFaces || settings.showEdges) {
            try {
              // console.debug("RendererProject, Viewport", currentProject, viewport3D)
              await self.sectionCutsLoader.loadSectionCuts(
                self.project,
                self.viewport3D,
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
      } else {
        // Remove existing section cuts
        self.viewport3D.emptySectionCutSceneForSectionCutGeometry();
      }
    }
  }

  // Return the SectionCuts class for AMD
  return SectionCuts;
});