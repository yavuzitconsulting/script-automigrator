#!/usr/bin/env node
// fix-code.js v1 - fixes code issues after angular upgrade
"use strict";

var fs = require("fs");
var path = require("path");

var VERSION = 1;
var fixes = [];

function log(msg) { console.log("  " + msg); }
function logFix(msg) { fixes.push(msg); console.log("  [fix] " + msg); }
function logSkip(msg) { console.log("  [skip] " + msg); }

// browserslist: remove outdated browsers that angular 17+ doesnt support
function fixBrowserslist() {
  log("checking browserslist...");

  // modern browserslist for angular 17+
  var modern = [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Edge versions",
    "last 2 Safari versions",
    "last 2 iOS versions",
    "Firefox ESR",
  ];

  // check .browserslistrc file
  if (fs.existsSync(".browserslistrc")) {
    var content = fs.readFileSync(".browserslistrc", "utf8");
    // check for outdated entries
    if (/kaios|op_mini|op_mob|android\s+\d|samsung|and_qq|and_uc|ie\s+\d/i.test(content)) {
      fs.writeFileSync(".browserslistrc", modern.join("\n") + "\n", "utf8");
      logFix("updated .browserslistrc with modern browsers");
      return;
    }
    logSkip(".browserslistrc looks ok");
    return;
  }

  // check package.json browserslist
  if (fs.existsSync("package.json")) {
    var pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    if (pkg.browserslist) {
      var str = JSON.stringify(pkg.browserslist);
      if (/kaios|op_mini|op_mob|android|samsung|and_qq|and_uc|ie\s/i.test(str)) {
        pkg.browserslist = modern;
        fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
        logFix("updated browserslist in package.json");
        return;
      }
      logSkip("browserslist in package.json looks ok");
      return;
    }
  }

  // no browserslist config found, create .browserslistrc
  fs.writeFileSync(".browserslistrc", modern.join("\n") + "\n", "utf8");
  logFix("created .browserslistrc with modern browsers");
}

// tsconfig: remove target/useDefineForClassFields that angular cli overrides anyway
function fixTsconfig() {
  log("checking tsconfig files...");

  var files = ["tsconfig.json", "tsconfig.app.json", "tsconfig.spec.json"];

  files.forEach(function(file) {
    if (!fs.existsSync(file)) return;

    try {
      var content = fs.readFileSync(file, "utf8");
      var ts = JSON.parse(content);
      var changed = false;

      if (ts.compilerOptions) {
        // angular cli sets these automatically, having them causes warnings
        // only remove if they conflict with what angular wants (ES2022)
        if (ts.compilerOptions.target && ts.compilerOptions.target.toLowerCase() !== "es2022") {
          delete ts.compilerOptions.target;
          changed = true;
        }
        if (ts.compilerOptions.useDefineForClassFields !== undefined) {
          delete ts.compilerOptions.useDefineForClassFields;
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(file, JSON.stringify(ts, null, 2) + "\n", "utf8");
        logFix(file + ": removed target/useDefineForClassFields (angular cli sets these)");
      }
    } catch (e) {
      // json parse error, skip
    }
  });
}

// sass: convert @import to @use (basic cases)
function fixSassImports() {
  log("checking sass files for deprecated @import...");

  var scssFiles = [];

  // find scss files in src/
  function findScss(dir) {
    if (!fs.existsSync(dir)) return;
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(function(e) {
      var full = path.join(dir, e.name);
      if (e.isDirectory() && e.name !== "node_modules") {
        findScss(full);
      } else if (e.isFile() && /\.scss$/.test(e.name)) {
        scssFiles.push(full);
      }
    });
  }

  findScss("src");

  var totalFixed = 0;
  scssFiles.forEach(function(file) {
    var content = fs.readFileSync(file, "utf8");
    var original = content;

    // convert @import to @use for node_modules imports
    // @import 'node_modules/foo/bar'; -> @use 'foo/bar' as *;
    content = content.replace(/@import\s+['"]node_modules\/([^'"]+)['"]\s*;/g, function(match, p) {
      return "@use '" + p + "' as *;";
    });

    // convert @import to @use for relative imports (simple cases)
    // @import 'variables'; -> @use 'variables' as *;
    // but skip partials that start with _ (those need different handling)
    content = content.replace(/@import\s+['"](?!.*node_modules)([^'"]+)['"]\s*;/g, function(match, p) {
      // keep as-is if it's a url() or http import
      if (/^(https?:|url\()/.test(p)) return match;
      return "@use '" + p + "' as *;";
    });

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      totalFixed++;
    }
  });

  if (totalFixed > 0) {
    logFix("converted @import to @use in " + totalFixed + " scss file(s)");
  } else {
    logSkip("no @import statements to convert");
  }
}

// remove polyfills.ts if it only contains zone.js (angular 17+ handles this)
function fixPolyfills() {
  log("checking polyfills.ts...");

  var file = "src/polyfills.ts";
  if (!fs.existsSync(file)) {
    logSkip("no polyfills.ts");
    return;
  }

  var content = fs.readFileSync(file, "utf8");
  // remove comments and whitespace
  var clean = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();

  // if only zone.js import remains, file can be deleted
  if (/^import\s+['"]zone\.js['"];?\s*$/.test(clean) || clean === "") {
    fs.unlinkSync(file);
    logFix("deleted polyfills.ts (zone.js is auto-imported in angular 17+)");

    // also update angular.json to remove polyfills reference
    if (fs.existsSync("angular.json")) {
      var aj = JSON.parse(fs.readFileSync("angular.json", "utf8"));
      var changed = false;

      if (aj.projects) {
        Object.keys(aj.projects).forEach(function(proj) {
          var p = aj.projects[proj];
          if (p.architect && p.architect.build && p.architect.build.options) {
            var opts = p.architect.build.options;
            if (opts.polyfills) {
              // remove src/polyfills.ts from array or string
              if (Array.isArray(opts.polyfills)) {
                var idx = opts.polyfills.indexOf("src/polyfills.ts");
                if (idx !== -1) {
                  opts.polyfills.splice(idx, 1);
                  changed = true;
                }
                // if only zone.js left, can simplify or remove
                if (opts.polyfills.length === 0) {
                  delete opts.polyfills;
                  changed = true;
                }
              } else if (opts.polyfills === "src/polyfills.ts") {
                delete opts.polyfills;
                changed = true;
              }
            }
          }
        });
      }

      if (changed) {
        fs.writeFileSync("angular.json", JSON.stringify(aj, null, 2) + "\n", "utf8");
        logFix("removed polyfills reference from angular.json");
      }
    }
  } else {
    logSkip("polyfills.ts has custom polyfills, keeping it");
  }
}

// main
function main() {
  console.log("fix-code v" + VERSION + "\n");

  if (!fs.existsSync("package.json")) {
    console.error("no package.json found");
    process.exit(1);
  }

  fixBrowserslist();
  fixTsconfig();
  fixSassImports();
  fixPolyfills();

  console.log("\n  ---");
  if (fixes.length === 0) {
    console.log("  no fixes needed");
  } else {
    console.log("  applied " + fixes.length + " fix(es)");
    console.log("  run npm run build to check for remaining issues");
  }
}

main();
