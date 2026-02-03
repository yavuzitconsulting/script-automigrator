#!/usr/bin/env node
// fix-deps.js v8
// fixes third-party dependencies after ng-upgrade-step.js has run
// bumps companion packages to versions compatible with the detected angular version
"use strict";

var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
var spawnSync = child_process.spawnSync;

var SCRIPT_VERSION = 8;

// ============================================================================
// compatibility map
// maps angular major version -> required companion package versions.
// "latest" means we'll resolve via npm view at runtime.
// packages not present in the project are skipped.
// ============================================================================

var COMPAT = {
  // angular 20
  20: {
    // -- core companions --
    "rxjs": "~7.8.1",
    "zone.js": "~0.15.0",
    "tslib": "^2.3.0",
    "typescript": "~5.8.3",

    // -- angular build packages --
    // Angular 20 uses @angular/build by default (replaces @angular-devkit/build-angular)
    "@angular/build": "~20.0.1",
    "@angular-devkit/build-angular": "~20.0.1", // still works as fallback
    "@angular-devkit/build-ng-packagr": null, // removed in v17+, delete if present
    "@angular/language-service": "~20.0.1",

    // -- angular cdk / material --
    "@angular/cdk": "~20.0.1",
    "@angular/material": "~20.0.1",

    // -- kendo ui for angular --
    // since v11 all @progress/kendo-angular-* packages share a single version.
    // for angular 20, minimum kendo version is 19.1.0 per telerik's compat table.
    // latest is 22.x but we'll target ~22.0.1 (supports angular 19-21).
    // the script will apply the same version to ALL @progress/kendo-angular-* packages.
    "@progress/kendo-angular-*": "~22.0.1",
    // kendo companion packages
    "@progress/kendo-data-query": "^1.7.0",
    "@progress/kendo-drawing": "^1.20.0",
    "@progress/kendo-theme-bootstrap": "^12.2.0",
    "@progress/kendo-theme-default": "^12.2.0",
    "@progress/kendo-theme-material": "^12.2.0",

    // -- ng-bootstrap --
    // ng-bootstrap 19.x supports angular 20
    // ng-bootstrap 20.x requires angular 21
    "@ng-bootstrap/ng-bootstrap": "~19.0.1",

    // -- bootstrap css --
    // ng-bootstrap 17+ requires bootstrap 5.3+
    "bootstrap": "^5.3.3",

    // -- testing --
    "@types/jasmine": "~5.1.4",
    "jasmine-core": "~5.4.0",
    "karma": "~6.4.4",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.1",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",

    // -- deprecated / removable --
    // these should be removed entirely from package.json
    "__remove__": [
      "core-js",
      "classlist.js",
      "web-animations-js",
      "rxjs-compat",
      "protractor",
      "tslint",
      "tsickle",
      "codelyzer",
      "karma-coverage-istanbul-reporter", // replaced by karma-coverage
      "@types/jasminewd2", // protractor types, not needed
      "jasmine-spec-reporter", // old jasmine reporter
      "scss-bundle", // not needed with modern build
      "ng-packagr", // handled by @angular-devkit/build-angular now
      "@progress/kendo-angular-schematics", // only needed for ng add, not runtime
    ],

    // overrides that reference old pinned deps -- clean these up
    "__remove_overrides__": [
      "loader-utils",
      "webpack",
      "xmlhttprequest-ssl",
      "tough-cookie",
      "form-data",
      "socket.io-parser",
      "ip",
    ],

    // these were pinned in deps as override sources -- remove if present
    "__remove_pinned__": [
      "loader-utils",
      "webpack",
      "xmlhttprequest-ssl",
      "tough-cookie",
      "form-data",
      "socket.io-parser",
      "ip",
    ],
  },

  // angular 19
  19: {
    "rxjs": "~7.8.1",
    "zone.js": "~0.15.0",
    "tslib": "^2.3.0",
    "typescript": "~5.5.4",
    "@angular-devkit/build-angular": "~19.2.4",
    "@angular-devkit/build-ng-packagr": null,
    "@angular/language-service": "~19.2.4",
    "@angular/cdk": "~19.2.4",
    "@angular/material": "~19.2.4",
    "@progress/kendo-angular-*": "~19.1.0",
    "@progress/kendo-data-query": "^1.7.0",
    "@progress/kendo-drawing": "^1.20.0",
    "@progress/kendo-theme-bootstrap": "^10.0.0",
    "@progress/kendo-theme-default": "^10.0.0",
    "@ng-bootstrap/ng-bootstrap": "~17.0.1",
    "bootstrap": "^5.3.3",
    "__remove__": [
      "core-js", "classlist.js", "web-animations-js", "rxjs-compat",
      "protractor", "tslint", "tsickle", "codelyzer",
    ],
  },

  // angular 18
  18: {
    "rxjs": "~7.8.1",
    "zone.js": "~0.14.10",
    "tslib": "^2.3.0",
    "typescript": "~5.4.5",
    "@angular-devkit/build-angular": "~18.2.12",
    "@angular-devkit/build-ng-packagr": null,
    "@angular/language-service": "~18.2.12",
    "@angular/cdk": "~18.2.12",
    "@angular/material": "~18.2.12",
    "@progress/kendo-angular-*": "~17.0.0",
    "@progress/kendo-data-query": "^1.7.0",
    "@progress/kendo-drawing": "^1.19.0",
    "@progress/kendo-theme-bootstrap": "^8.0.0",
    "@progress/kendo-theme-default": "^8.0.0",
    "@ng-bootstrap/ng-bootstrap": "~16.0.0",
    "bootstrap": "^5.3.3",
    "__remove__": [
      "core-js", "classlist.js", "web-animations-js", "rxjs-compat",
      "protractor", "tslint", "tsickle", "codelyzer",
    ],
  },
};

// ============================================================================
// helpers
// ============================================================================

function readPkgJson() {
  return JSON.parse(fs.readFileSync("package.json", "utf8"));
}

function writePkgJson(obj) {
  fs.writeFileSync("package.json", JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function readAngularJson() {
  if (!fs.existsSync("angular.json")) return null;
  return JSON.parse(fs.readFileSync("angular.json", "utf8"));
}

function writeAngularJson(obj) {
  fs.writeFileSync("angular.json", JSON.stringify(obj, null, 2) + "\n", "utf8");
}

// ============================================================================
// angular.json fixes (for Angular 17+)
// ============================================================================

function fixAngularJson() {
  var angularJson = readAngularJson();
  if (!angularJson) {
    console.log("  no angular.json found, skipping angular.json fixes");
    return;
  }

  var changed = false;
  var changes = [];

  // remove defaultProject (deprecated in Angular 15+)
  if (angularJson.defaultProject !== undefined) {
    delete angularJson.defaultProject;
    changed = true;
    changes.push("removed deprecated 'defaultProject'");
  }

  // update builders from :browser to :application
  if (angularJson.projects) {
    Object.keys(angularJson.projects).forEach(function (projectName) {
      var project = angularJson.projects[projectName];
      if (project.architect) {
        Object.keys(project.architect).forEach(function (targetName) {
          var target = project.architect[targetName];
          if (target.builder) {
            // update browser -> application
            if (target.builder === "@angular-devkit/build-angular:browser") {
              target.builder = "@angular-devkit/build-angular:application";
              changed = true;
              changes.push(projectName + "." + targetName + ": browser -> application builder");
            }
            // update to new @angular/build package (optional, for full migration)
            // if (target.builder === "@angular-devkit/build-angular:application") {
            //   target.builder = "@angular/build:application";
            //   changed = true;
            // }
          }
        });
      }
    });
  }

  if (changed) {
    writeAngularJson(angularJson);
    console.log("\n  angular.json fixes applied:");
    changes.forEach(function (c) { console.log("    - " + c); });
  } else {
    console.log("  angular.json looks ok, no changes needed");
  }
}

function detectAngularVersion() {
  var pkg = readPkgJson();
  var deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  var v = deps["@angular/core"];
  if (!v) { console.error("no @angular/core found."); process.exit(1); }
  var m = v.replace(/^[\^~>=<\s]+/, "").match(/^(\d+)/);
  if (!m) { console.error("cannot parse @angular/core version: " + v); process.exit(1); }
  return +m[1];
}

function getNpmVersion() {
  try { return spawnSync("npm", ["--version"], { encoding: "utf8", shell: true }).stdout.trim(); }
  catch (_) { return "unknown"; }
}

// ============================================================================
// semver utilities (from ng-upgrade-step.js)
// ============================================================================

function parseSemver(v) {
  var m = String(v).match(/^(\d+)\.(\d+)\.(\d+)/);
  return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null;
}

function compareSemver(a, b) {
  var pa = parseSemver(a), pb = parseSemver(b);
  if (!pa || !pb) return 0;
  return pa.major !== pb.major ? pa.major - pb.major : pa.minor !== pb.minor ? pa.minor - pb.minor : pa.patch - pb.patch;
}

function findBestVersion(versions, wanted) {
  var clean = wanted.replace(/^[\^~>=<\s]+/, "");
  var target = parseSemver(clean);
  if (!target) return versions[versions.length - 1];
  // filter to stable versions only (no alpha/beta/rc), then sort
  var stable = versions.filter(function (v) { return parseSemver(v); }).sort(compareSemver);
  // exact match
  var exact = stable.find(function (v) { return v === clean; });
  if (exact) return exact;
  // same major, >= wanted
  var sameMajGe = stable.filter(function (v) { var p = parseSemver(v); return p.major === target.major && compareSemver(v, clean) >= 0; });
  if (sameMajGe.length) return sameMajGe[0];
  // same major, any version (take highest)
  var sameMaj = stable.filter(function (v) { return parseSemver(v).major === target.major; });
  if (sameMaj.length) return sameMaj[sameMaj.length - 1];
  // any higher version
  var higher = stable.filter(function (v) { return compareSemver(v, clean) >= 0; });
  if (higher.length) return higher[0];
  // fallback to latest
  return stable[stable.length - 1];
}

// ============================================================================
// registry resolution
// ============================================================================

function getAllVersions(name, verbose) {
  if (verbose) console.log("    > npm view " + name + " versions");
  var r = spawnSync("npm", ["view", "--json", name, "versions"], { encoding: "utf8", timeout: 60000, shell: true });
  if (r.status !== 0) {
    if (verbose) console.log("    ! registry query failed for " + name);
    return null;
  }
  try {
    var p = JSON.parse(r.stdout.trim());
    var vers = typeof p === "string" ? [p] : Array.isArray(p) ? p : null;
    if (verbose && vers) console.log("    found " + vers.length + " versions");
    return vers;
  } catch (_) {
    if (verbose) console.log("    ! failed to parse registry response for " + name);
    return null;
  }
}

function getLatestVersion(name, verbose) {
  if (verbose) console.log("    > npm view " + name + " version (latest)");
  var r = spawnSync("npm", ["view", "--json", name, "version"], { encoding: "utf8", timeout: 60000, shell: true });
  if (r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout.trim());
  } catch (_) { return null; }
}

function resolveVersion(name, wanted, verbose) {
  // handle "latest" keyword
  if (wanted === "latest") {
    var latest = getLatestVersion(name, verbose);
    if (latest) {
      console.log("    " + name + ": latest -> " + latest);
      return latest;
    }
    console.log("    warning: could not resolve 'latest' for " + name);
    return wanted;
  }

  var vers = getAllVersions(name, verbose);
  if (!vers || !vers.length) {
    console.log("    warning: '" + name + "' not in registry, using wanted version: " + wanted);
    return wanted;
  }
  var picked = findBestVersion(vers, wanted);
  var wantedClean = wanted.replace(/^[\^~>=<\s]+/, "");
  if (picked !== wantedClean) {
    console.log("    " + name + ": " + wanted + " -> " + picked + " (best available)");
  } else {
    if (verbose) console.log("    " + name + ": " + wanted + " (exact match)");
  }
  return picked;
}

// ============================================================================
// analysis
// ============================================================================

function analyzeProject(angularMajor) {
  var compat = COMPAT[angularMajor];
  if (!compat) {
    console.log("  no compatibility data for angular v" + angularMajor + ".");
    console.log("  supported: " + Object.keys(COMPAT).join(", "));
    process.exit(1);
  }

  var pkg = readPkgJson();
  var deps = pkg.dependencies || {};
  var devDeps = pkg.devDependencies || {};
  var allDeps = Object.assign({}, deps, devDeps);

  var updates = [];    // { name, from, to, section }
  var removals = [];   // { name, section }
  var kendoUpdates = []; // separate because we glob them

  // collect explicit kendo package names (these take precedence over wildcard)
  var explicitKendoPackages = Object.keys(compat).filter(function (name) {
    return name.indexOf("@progress/kendo-angular-") === 0 && name !== "@progress/kendo-angular-*";
  });

  // collect packages marked for removal (should not be updated by wildcard)
  var packagesToRemove = (compat["__remove__"] || []).concat(
    compat["__remove_pinned__"] || [],
    compat["__remove_overrides__"] || []
  );

  // check each package in our compat map
  Object.keys(compat).forEach(function (name) {
    if (name === "__remove__") return;

    var targetVersion = compat[name];

    // handle kendo wildcard
    if (name === "@progress/kendo-angular-*") {
      // find all @progress/kendo-angular-* packages in the project
      Object.keys(allDeps).forEach(function (depName) {
        if (depName.indexOf("@progress/kendo-angular-") === 0) {
          // skip packages that have explicit entries (they'll be handled separately)
          if (explicitKendoPackages.indexOf(depName) !== -1) return;
          // skip packages marked for removal
          if (packagesToRemove.indexOf(depName) !== -1) return;

          var current = allDeps[depName];
          var section = deps[depName] ? "dependencies" : "devDependencies";
          var currentClean = current.replace(/^[\^~>=<\s]+/, "");
          var targetClean = targetVersion.replace(/^[\^~>=<\s]+/, "");
          if (currentClean !== targetClean) {
            kendoUpdates.push({ name: depName, from: current, to: targetVersion, section: section });
          }
        }
      });
      return;
    }

    // null means "remove if present"
    if (targetVersion === null) {
      if (allDeps[name]) {
        var section = deps[name] ? "dependencies" : "devDependencies";
        removals.push({ name: name, section: section });
      }
      return;
    }

    // only update if the package exists in the project
    if (allDeps[name]) {
      var current = allDeps[name];
      var section = deps[name] ? "dependencies" : "devDependencies";
      // check if version is already compatible (rough check)
      var currentClean = current.replace(/^[\^~>=<\s]+/, "");
      var targetClean = targetVersion.replace(/^[\^~>=<\s]+/, "");
      if (currentClean !== targetClean) {
        updates.push({ name: name, from: current, to: targetVersion, section: section });
      }
    }
  });

  // check removals list
  var removeList = compat["__remove__"] || [];
  removeList.forEach(function (name) {
    if (allDeps[name]) {
      var section = deps[name] ? "dependencies" : "devDependencies";
      // avoid duplicates
      if (!removals.find(function (r) { return r.name === name; })) {
        removals.push({ name: name, section: section });
      }
    }
  });

  // check pinned deps - remove from dependencies but keep as overrides for transitive deps
  var pinnedList = compat["__remove_pinned__"] || [];
  var pinnedOverrides = []; // these will become overrides with resolved versions
  pinnedList.forEach(function (name) {
    if (allDeps[name]) {
      var section = deps[name] ? "dependencies" : "devDependencies";
      if (!removals.find(function (r) { return r.name === name; })) {
        removals.push({ name: name, section: section });
      }
      // also track for override resolution
      pinnedOverrides.push(name);
    }
  });

  // collect overrides to remove (only those not in pinnedList)
  var overrideRemovals = [];
  var overrideList = compat["__remove_overrides__"] || [];
  overrideList.forEach(function (name) {
    // don't remove if it's a pinned package - we'll resolve it instead
    if (pinnedList.indexOf(name) !== -1) return;
    if (pkg.overrides && pkg.overrides[name]) {
      overrideRemovals.push(name);
    }
  });

  return {
    updates: updates,
    kendoUpdates: kendoUpdates,
    removals: removals,
    overrideRemovals: overrideRemovals,
    pinnedOverrides: pinnedOverrides, // new: packages that need override resolution
  };
}

// ============================================================================
// apply changes
// ============================================================================

function applyChanges(analysis, useResolve, verbose) {
  var pkg = readPkgJson();
  var changed = 0;

  // helper to get the final version (resolve from registry if enabled)
  function getVersion(name, wanted) {
    if (!useResolve) return wanted;
    var resolved = resolveVersion(name, wanted, verbose);
    // handle "latest" - don't add prefix
    if (wanted === "latest") return resolved;
    // preserve the prefix (^ or ~) from wanted, but use resolved version number
    var prefix = wanted.match(/^[\^~]/);
    return (prefix ? prefix[0] : "") + resolved;
  }

  // apply updates
  if (useResolve) {
    console.log("\n  resolving package versions from registry...");
  } else {
    console.log("\n  applying package versions...");
  }
  analysis.updates.forEach(function (u) {
    if (pkg[u.section] && pkg[u.section][u.name]) {
      pkg[u.section][u.name] = getVersion(u.name, u.to);
      changed++;
    }
  });

  // apply kendo updates
  analysis.kendoUpdates.forEach(function (u) {
    if (pkg[u.section] && pkg[u.section][u.name]) {
      pkg[u.section][u.name] = getVersion(u.name, u.to);
      changed++;
    }
  });

  // apply removals
  analysis.removals.forEach(function (r) {
    if (pkg.dependencies && pkg.dependencies[r.name]) {
      delete pkg.dependencies[r.name];
      changed++;
    }
    if (pkg.devDependencies && pkg.devDependencies[r.name]) {
      delete pkg.devDependencies[r.name];
      changed++;
    }
  });

  // remove overrides
  if (analysis.overrideRemovals && analysis.overrideRemovals.length && pkg.overrides) {
    analysis.overrideRemovals.forEach(function (name) {
      if (pkg.overrides[name]) {
        delete pkg.overrides[name];
        changed++;
      }
    });
  }

  // add/update overrides for pinned packages (so transitive deps can resolve)
  if (analysis.pinnedOverrides && analysis.pinnedOverrides.length) {
    if (!pkg.overrides) pkg.overrides = {};
    console.log("\n  resolving pinned package overrides for transitive deps...");
    analysis.pinnedOverrides.forEach(function (name) {
      // resolve latest available version from registry
      var resolved = resolveVersion(name, "latest", verbose);
      if (resolved && resolved !== "latest") {
        pkg.overrides[name] = resolved;
        console.log("    " + name + " -> " + resolved + " (override for transitive deps)");
        changed++;
      }
    });
  }

  // remove overrides block entirely if empty
  if (pkg.overrides && Object.keys(pkg.overrides).length === 0) {
    delete pkg.overrides;
  }

  writePkgJson(pkg);
  return changed;
}

// ============================================================================
// npm install
// ============================================================================

function cleanBeforeInstall() {
  console.log("\n  cleaning stale files...");

  // delete package-lock.json
  if (fs.existsSync("package-lock.json")) {
    fs.unlinkSync("package-lock.json");
    console.log("    deleted package-lock.json");
  }

  // delete node_modules (cross-platform)
  if (fs.existsSync("node_modules")) {
    console.log("    deleting node_modules (this may take a moment)...");
    var isWindows = process.platform === "win32";
    var res;
    if (isWindows) {
      res = spawnSync("cmd", ["/c", "rmdir", "/s", "/q", "node_modules"], { stdio: "inherit", shell: true });
    } else {
      res = spawnSync("rm", ["-rf", "node_modules"], { stdio: "inherit", shell: true });
    }
    if (res.status === 0) {
      console.log("    deleted node_modules");
    } else {
      console.log("    warning: could not delete node_modules, continuing anyway");
    }
  }
}

function runNpmInstall() {
  cleanBeforeInstall();

  // --omit=optional skips optional deps like kendo-angular-schematics that may not be in registry
  console.log("\n  running npm install --force --legacy-peer-deps --omit=optional ...\n");
  var res = spawnSync("npm", ["install", "--force", "--legacy-peer-deps", "--omit=optional"], {
    stdio: "inherit", shell: true, timeout: 600000, cwd: process.cwd()
  });
  return res.status === 0;
}

// ============================================================================
// report
// ============================================================================

function printReport(analysis, angularMajor) {
  var overrides = analysis.overrideRemovals || [];
  var pinnedOverrides = analysis.pinnedOverrides || [];
  var totalChanges = analysis.updates.length + analysis.kendoUpdates.length + analysis.removals.length + overrides.length + pinnedOverrides.length;

  if (totalChanges === 0) {
    console.log("\n  all dependencies look compatible with angular v" + angularMajor + ". nothing to do.");
    return;
  }

  console.log("\n  found " + totalChanges + " dependency issue(s) for angular v" + angularMajor + ":\n");

  if (analysis.updates.length) {
    console.log("  updates:");
    analysis.updates.forEach(function (u) {
      console.log("    " + u.name + ": " + u.from + " -> " + u.to + " (" + u.section + ")");
    });
  }

  if (analysis.kendoUpdates.length) {
    console.log("\n  kendo updates (" + analysis.kendoUpdates.length + " packages -> " + analysis.kendoUpdates[0].to + "):");
    analysis.kendoUpdates.forEach(function (u) {
      console.log("    " + u.name + ": " + u.from + " -> " + u.to);
    });
  }

  if (analysis.removals.length) {
    console.log("\n  removals (deprecated/obsolete):");
    analysis.removals.forEach(function (r) {
      console.log("    " + r.name + " (" + r.section + ")");
    });
  }

  if (overrides.length) {
    console.log("\n  overrides to remove (no longer needed):");
    overrides.forEach(function (name) {
      console.log("    " + name);
    });
  }

  if (pinnedOverrides.length) {
    console.log("\n  pinned packages to resolve as overrides (for transitive deps):");
    pinnedOverrides.forEach(function (name) {
      console.log("    " + name);
    });
  }
}

// ============================================================================
// main
// ============================================================================

function main() {
  console.log("fix-deps.js v" + SCRIPT_VERSION + "\n");

  if (!fs.existsSync("package.json")) {
    console.error("error: no package.json found. run from your angular project root.");
    process.exit(1);
  }

  var angularMajor = detectAngularVersion();
  console.log("  detected angular v" + angularMajor);
  console.log("  node " + process.version + ", npm " + getNpmVersion());

  if (process.argv.includes("--help")) {
    console.log("\nfix-deps.js -- fix third-party deps after angular upgrade\n");
    console.log("  node fix-deps.js             dry run (show what would change)");
    console.log("  node fix-deps.js --yes        apply changes + npm install (recommended)");
    console.log("  node fix-deps.js --update     apply changes only (no npm install)");
    console.log("  node fix-deps.js --no-resolve skip registry resolution (use hardcoded versions)");
    console.log("  node fix-deps.js --quiet      suppress verbose output");
    console.log("  node fix-deps.js --help       this message");
    console.log("\nnotes:");
    console.log("  - registry resolution is ON by default (queries npm for available versions)");
    console.log("  - verbose output is ON by default (shows registry queries)");
    process.exit(0);
  }

  var analysis = analyzeProject(angularMajor);
  printReport(analysis, angularMajor);

  var totalChanges = analysis.updates.length + analysis.kendoUpdates.length + analysis.removals.length + (analysis.overrideRemovals || []).length;
  if (totalChanges === 0) {
    process.exit(0);
  }

  var doApply = process.argv.includes("--yes") || process.argv.includes("--update");
  var doInstall = process.argv.includes("--yes");
  // --resolve and --verbose are ON by default, use --no-resolve / --quiet to disable
  var doResolve = !process.argv.includes("--no-resolve");
  var doVerbose = !process.argv.includes("--quiet");

  if (!doApply) {
    console.log("\n  dry run. use --yes to apply changes and install, or --update to just update package.json.");
    process.exit(0);
  }

  // apply package.json changes
  console.log("\n  applying changes to package.json ...");
  var changed = applyChanges(analysis, doResolve, doVerbose);
  console.log("  updated " + changed + " entries.");

  // fix angular.json
  fixAngularJson();

  if (doInstall) {
    var ok = runNpmInstall();
    if (!ok) {
      console.error("\n  npm install failed. check output above and fix manually.");
      process.exit(1);
    }
    console.log("\n  done. try 'ng build' to see if there are remaining issues.");
  } else {
    console.log("\n  package.json updated. run 'npm install --force --legacy-peer-deps --omit=optional' when ready.");
  }

  // post-install notes
  console.log("\n  notes:");
  console.log("  - kendo packages were bumped to latest. there will likely be breaking api changes.");
  console.log("  - check kendo changelog: https://www.telerik.com/kendo-angular-ui/components/changelogs/kendo-angular-ui");
  console.log("  - if using @ng-bootstrap, bootstrap css must be v5.3+.");
  console.log("  - removed packages (core-js, protractor, tslint, etc.) may need replacement:");
  console.log("      tslint -> eslint (@angular-eslint/schematics)");
  console.log("      protractor -> cypress or playwright");
  console.log("      core-js -> not needed since angular 12+");
  console.log("  - run 'ng build' and fix errors iteratively.");
}

main();
