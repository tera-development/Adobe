// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ReplaceFile2MediaFolderFile.ts":[function(require,module,exports) {
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReplaceFile2MediaFolderFile = void 0;
var ReplaceFile2MediaFolderFile = /*#__PURE__*/function () {
  function ReplaceFile2MediaFolderFile() {
    _classCallCheck(this, ReplaceFile2MediaFolderFile);
    this.scriptName = this.constructor.name;
  }
  _createClass(ReplaceFile2MediaFolderFile, [{
    key: "main",
    value: function main() {
      var acriveComp = app.project.activeItem;
      var fileLayers = this.extractFileLayers(acriveComp);
      var sourceFileId = this.replaceFileItem(fileLayers);
      this.deleteFileItem(sourceFileId);
    }
  }, {
    key: "extractFileLayers",
    value: function extractFileLayers(i_comp) {
      var fileLayers = [];
      for (var l = 1; l <= i_comp.numLayers; l++) {
        var layer = i_comp.layer(l);
        var item = layer.source;
        if (item instanceof CompItem) {
          var nestFileLayers = this.extractFileLayers(item);
          fileLayers = fileLayers.concat(nestFileLayers);
        } else if (item instanceof FootageItem) {
          fileLayers.push(layer);
        }
      }
      return fileLayers;
    }
  }, {
    key: "replaceFileItem",
    value: function replaceFileItem(i_fileLayers) {
      var sourceFileIds = [];
      var allItems = app.project.items;
      i_fileLayers.forEach(function (fileLayer) {
        var fileItem = fileLayer.source;
        for (var i = 1; i <= allItems.length; i++) {
          var item = allItems[i];
          if (!(item instanceof FootageItem)) continue;
          if (item.id != fileItem.id && item.name == fileItem.name) {
            fileLayer.replaceSource(item, false);
            sourceFileIds.push(fileItem.id);
            break;
          }
        }
      });
      return sourceFileIds;
    }
  }, {
    key: "deleteFileItem",
    value: function deleteFileItem(i_fileIds) {
      var allItems = app.project.items;
      i_fileIds.forEach(function (fileId) {
        for (var i = 1; i <= allItems.length; i++) {
          var item = allItems[i];
          if (!(item instanceof FootageItem)) continue;
          if (item.id == fileId) {
            item.remove();
            break;
          }
        }
      });
    }
  }]);
  return ReplaceFile2MediaFolderFile;
}();
exports.ReplaceFile2MediaFolderFile = ReplaceFile2MediaFolderFile;
},{}]},{},["ReplaceFile2MediaFolderFile.ts"], null)