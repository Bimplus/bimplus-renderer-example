define(function () {
  'use strict';

  /**
   * Renderer settings utilities for managing viewport options
   * @param {Object} viewport3D - The 3D viewport instance
   * @returns {Object} Object containing all settings functions
   */
  function createSettingsManager(viewport3D) {
    
    /**
     * Get default ambient occlusion settings
     */
    function getDefaultSettings() {
      let viewportOcclusionOptions = viewport3D.getAmbientOcclusionOptions();
      viewport3D.setAmbientOcclusionOptions(viewportOcclusionOptions);
    }

    /**
     * Toggle ambient occlusion on/off
     */
    function toggleAmbientOcclusion() {
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
    }

    /**
     * Toggle shadows on/off
     */
    function toggleShadows() {
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
    }

    /**
     * Toggle light color between white and red
     */
    function toggleLightColor() {
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
    }

    /**
     * Toggle ambient light color settings
     */
    function toggleAmbientLightColor() {
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
    }

    // Return all functions as an object
    return {
      getDefaultSettings: getDefaultSettings,
      toggleAmbientOcclusion: toggleAmbientOcclusion,
      toggleShadows: toggleShadows,
      toggleLightColor: toggleLightColor,
      toggleAmbientLightColor: toggleAmbientLightColor
    };
  }

  // Return the factory function for AMD
  return {
    createSettingsManager: createSettingsManager
  };
});