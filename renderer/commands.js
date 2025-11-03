define(function () {
  'use strict';

  /**
   * Creates a command manager for 3D renderer operations
   * @param {Object} dependencies - Object containing required dependencies
   * @param {Object} dependencies.viewport3D - The 3D viewport instance
   * @param {Object} dependencies.sectionCutLogic - The section cut logic instance
   * @returns {Object} Object containing all command functions organized by category
   */
  function createCommandManager(dependencies) {
    const { viewport3D, sectionCutLogic } = dependencies;

    // ===============================================================
    // Camera position commands
    // ===============================================================

    /**
     * Reset the current view and camera state
     */
    function resetView() {
      viewport3D.resetSelectionMode();
      viewport3D.restoreViewbox();
      viewport3D.setRotationCenter(null);
      // No object is selected anymore, don't show object properties tab
      $("#objectProperties").fadeOut();
    }

    /**
     * Set camera to front view
     */
    function frontView() {
      viewport3D.setCameraResetAxis("x");
    }

    /**
     * Set camera to top view
     */
    function topView() {
      viewport3D.setCameraResetAxis("y");
    }

    /**
     * Set camera to side view
     */
    function sideView() {
      viewport3D.setCameraResetAxis("z");
    }

    /**
     * Set camera to perspective view
     */
    function perspectiveView() {
      viewport3D.setCameraResetAxis("xyz");
    }

    // ===============================================================
    // Object isolation commands
    // ===============================================================

    /**
     * Reset viewer selection mode
     */
    function resetSelectionMode() {
      if (viewport3D.checkSelectionMode("hideIsolated") === true) {
        isolateHide(); // toggle isolateHide mode
      } else if (viewport3D.checkSelectionMode("clipIsolated") === true) {
        isolateClippingBox(); // toggle isolateClippingBox mode
      } else {
        isolate(); // toggle isolate mode
      }
    }

    /**
     * Switch on isolation mode - all other elements will be grey and transparent
     */
    function isolate() {
      viewport3D.setSelectionMode("isolated");
    }

    /**
     * Switch on hidden isolation mode - all other elements will be hidden
     */
    function isolateHide() {
      viewport3D.setSelectionMode("hideIsolated");
    }

    /**
     * Switch on clipping isolation mode - all elements outside the isolated elements
     * bounding box will be clipped
     */
    function isolateClippingBox() {
      viewport3D.setSelectionMode("clipIsolated");
    }

    // ===============================================================
    // Object colorization commands
    // ===============================================================

    /**
     * Set all objects to a specific color
     * @param {string} color - RGB color string
     */
    function setAllObjectsToColor(color) {
      const objectIds = [];
      // Extract all object id's
      for (let obj of viewport3D.getObjectsContainer().getObjectsArray()) {
        objectIds.push(obj.id);
      }
      viewport3D.colorizeObjects(objectIds, color);
      viewport3D.draw();
    }

    /**
     * Set all objects to green color
     */
    function setAllObjectsToGreen() {
      setAllObjectsToColor("rgb(0,128,0)");
    }

    /**
     * Set all objects to blue color
     */
    function setAllObjectsToBlue() {
      setAllObjectsToColor("rgb(0,0,255)");
    }

    /**
     * Reset color for all objects to default
     */
    function resetColorForAllObjects() {
      viewport3D.resetColoredObjects();
      viewport3D.draw();
    }

    // ===============================================================
    // Section cuts / clipping planes commands
    // ===============================================================

    /**
     * Reset section cuts
     */
    function resetSections() {
      if (viewport3D.checkSelectionMode("section") === true) {
        viewport3D.setSelectionMode("section");
        viewport3D.clippingPlanes.onRefreshSectionCuts();
        viewport3D.showClippingFrames(false); // don't show red frame anymore
        viewport3D.switchVisibilityOfTransformControls();
        sectionCutLogic.turnOffSectionCuts();
      }
    }

    /**
     * Use X plane as default section plane
     */
    function useXPlaneAsDefault() {
      if (viewport3D.checkSelectionMode("section") === false) {
        sectionCutLogic.turnOnSectionCuts();
        viewport3D.setSectionAxis("x");
      }
      if (viewport3D.checkSelectionMode("section") === false) {
        viewport3D.setSelectionMode("section");
      }
    }

    /**
     * Set section plane to x axis
     */
    function sectionX() {
      sectionCutLogic.turnOnSectionCuts();
      viewport3D.setSectionAxis("x");
      if (viewport3D.checkSelectionMode("section") === false) {
        viewport3D.setSelectionMode("section");
      }
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }

    /**
     * Set section plane to y axis
     */
    function sectionY() {
      sectionCutLogic.turnOnSectionCuts();
      viewport3D.setSectionAxis("y");
      if (viewport3D.checkSelectionMode("section") === false) {
        viewport3D.setSelectionMode("section");
      }
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }

    /**
     * Set section plane to z axis
     */
    function sectionZ() {
      sectionCutLogic.turnOnSectionCuts();
      viewport3D.setSectionAxis("z");
      if (viewport3D.checkSelectionMode("section") === false) {
        viewport3D.setSelectionMode("section");
      }
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }

    /**
     * Set section plane to free axis - interactive selection of plane will be started
     */
    function sectionFree() {
      sectionCutLogic.turnOnSectionCuts();
      viewport3D.setSectionAxis("Free");
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }

    /**
     * Turn on single plane mode
     */
    function useSinglePlane() {
      useXPlaneAsDefault();
      viewport3D.setSinglePlaneMode();
      viewport3D.clippingPlanes.updateClippingPlanes();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Turn on parallel planes mode
     */
    function useParallelPlanes() {
      useXPlaneAsDefault();
      viewport3D.setParallelPlaneMode();
      viewport3D.clippingPlanes.updateClippingPlanes();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Turn on box planes mode
     */
    function useBox() {
      useXPlaneAsDefault();
      viewport3D.setBoxPlaneMode();
      viewport3D.clippingPlanes.updateClippingPlanes();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Turn on translation control
     */
    function useTranslationControl() {
      useXPlaneAsDefault();
      viewport3D.useTranslationForTransformControls();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Turn on scaling control
     */
    function useScaleControl() {
      useXPlaneAsDefault();
      viewport3D.useScaleForTransformControls();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Turn on rotation control
     */
    function useRotationControl() {
      useXPlaneAsDefault();
      viewport3D.useRotationForTransformControls();
      sectionCutLogic.refreshSectionCuts();
    }

    /**
     * Toggle visibility of transform controls
     */
    function toggleControlVisibility() {
      useXPlaneAsDefault();
      viewport3D.switchVisibilityOfTransformControls(true);
    }

    /**
     * Flip the clipping plane
     */
    function flipClippingPlane() {
      useXPlaneAsDefault();
      viewport3D.flipOrientation();
      viewport3D.emptySectionCutSceneForSectionCutGeometry();
      viewport3D.clippingPlanes.onRefreshSectionCuts();
    }

    // ===============================================================
    // Camera and display commands
    // ===============================================================

    /**
     * Toggle camera type between perspective and orthographic
     */
    function toggleCameraType() {
      const $checkbox = $("#icon-toggle-camera-type");
      const isChecked = $checkbox.is(":checked");
      const $label = $checkbox.closest("label");

      if (isChecked) {
        $label.find(".icon-on").show();
        $label.find(".icon-off").hide();
        $label.attr("title", "Camera type is orthographic");
      } else {
        $label.find(".icon-on").hide();
        $label.find(".icon-off").show();
        $label.attr("title", "Camera type is perspective");
      }

      console.log("Camera type:", isChecked ? "Orthographic" : "Perspective");

      viewport3D.toggleProjectionMode(viewport3D);
    }

    // ===============================================================
    // Object visibility commands
    // ===============================================================

    /**
     * Switch on and off the hide mode in viewer. If this is enabled then clicking an object will hide it.
     * @param {boolean} value - Whether to enable hide mode
     */
    function toggleHideObject(value) {
      if (value === true) {
        viewport3D.setSelectionMode("hidden");
      } else {
        viewport3D.unsetSelectionMode("hidden");
      }
    }

    /**
     * Reset hidden objects to visible state
     */
    function resetHiddenObjects() {
      viewport3D.resetHiddenObjects();
      viewport3D.draw();
    }

    // ===============================================================
    // Navigation commands
    // ===============================================================

    /**
     * Center viewport on selected objects
     */
    function centerObjects() {
      let selectedObjects = viewport3D.objectSets.selectedObjects.map((obj) => {
        return obj.id;
      });
      viewport3D.centerObjects(selectedObjects);
      console.debug("Center viewport for selected objects");
      if (selectedObjects.length == 0) {
        alert("Center function needs at least one selected object");
      }
    }

    // Return all commands organized by category
    return {
      // Camera commands
      camera: {
        resetView: resetView,
        frontView: frontView,
        topView: topView,
        sideView: sideView,
        perspectiveView: perspectiveView,
        toggleCameraType: toggleCameraType
      },
      
      // Isolation commands
      isolation: {
        resetSelectionMode: resetSelectionMode,
        isolate: isolate,
        isolateHide: isolateHide,
        isolateClippingBox: isolateClippingBox
      },
      
      // Color commands
      color: {
        setAllObjectsToColor: setAllObjectsToColor,
        setAllObjectsToGreen: setAllObjectsToGreen,
        setAllObjectsToBlue: setAllObjectsToBlue,
        resetColorForAllObjects: resetColorForAllObjects
      },
      
      // Section cut commands
      sections: {
        resetSections: resetSections,
        useXPlaneAsDefault: useXPlaneAsDefault,
        sectionX: sectionX,
        sectionY: sectionY,
        sectionZ: sectionZ,
        sectionFree: sectionFree,
        useSinglePlane: useSinglePlane,
        useParallelPlanes: useParallelPlanes,
        useBox: useBox,
        useTranslationControl: useTranslationControl,
        useScaleControl: useScaleControl,
        useRotationControl: useRotationControl,
        toggleControlVisibility: toggleControlVisibility,
        flipClippingPlane: flipClippingPlane
      },
      
      // Object visibility commands
      visibility: {
        toggleHideObject: toggleHideObject,
        resetHiddenObjects: resetHiddenObjects
      },
      
      // Navigation commands
      navigation: {
        centerObjects: centerObjects
      }
    };
  }

  // Return the factory function for AMD
  return {
    createCommandManager: createCommandManager
  };
});