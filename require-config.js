require = {
  paths: {
    // the left side is the module ID,
    // the right side is the path to
    "ie-array-find-polyfill": "node_modules/ie-array-find-polyfill/index",
    "babel-polyfill": "node_modules/babel-polyfill/dist/polyfill.min",
    "bimplus/websdk": "node_modules/bimplus-websdk/dist/bimplus-websdk",
    "bimplus/renderer": "node_modules/bimplus-renderer/dist/bimplus-renderer",
    "bimplus/webclient": "node_modules/bimplus-webclient/dist/bimplus-webclient",
    "oidc-client-ts": "node_modules/oidc-client-ts/dist/browser/oidc-client-ts.min",
    "SectionCuts": "renderer/sectionCuts",
    "utils": "renderer/utils",
    "settings": "renderer/settings",
    "commands": "renderer/commands",
  },
  shim: {
    "oidc-client-ts": {
      exports: "oidc"
    }
  }
};
