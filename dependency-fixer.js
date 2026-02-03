#!/usr/bin/env node
// fix-deps.js v14 - fixes deps after ng-upgrade-step.js
"use strict";

var fs = require("fs");
var path = require("path");
var spawnSync = require("child_process").spawnSync;

var COMPAT = {
  20: {
    "rxjs": "~7.8.1",
    "zone.js": "~0.15.0",
    "tslib": "^2.3.0",
    "typescript": "~5.8.3",
    "@angular/build": "~20.0.1",
    "@angular-devkit/build-angular": "~20.0.1",
    "@angular-devkit/build-ng-packagr": null,
    "@angular/language-service": "~20.0.1",
    "@angular/cdk": "~20.0.1",
    "@angular/material": "~20.0.1",
    "@progress/kendo-angular-*": "~22.0.1",
    "@progress/kendo-data-query": "^1.7.0",
    "@progress/kendo-drawing": "^1.20.0",
    "@progress/kendo-theme-bootstrap": "^12.2.0",
    "@progress/kendo-theme-default": "^12.2.0",
    "@progress/kendo-theme-material": "^12.2.0",
    "@ng-bootstrap/ng-bootstrap": "~19.0.1",
    "@popperjs/core": "^2.11.8",
    "bootstrap": "^5.3.3",
    // kendo peer deps (required since kendo v12+)
    "@progress/kendo-licensing": "^1.4.0",
    "@progress/kendo-angular-icons": "~22.0.1",
    "@progress/kendo-angular-utils": "~22.0.1",
    "@progress/kendo-angular-navigation": "~22.0.1",
    "@progress/kendo-svg-icons": "^4.0.0",
    "@types/jasmine": "~5.1.4",
    "jasmine-core": "~5.4.0",
    "karma": "~6.4.4",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.1",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.1.0",
    "__remove__": [
      "core-js", "classlist.js", "web-animations-js", "rxjs-compat",
      "protractor", "tslint", "tsickle", "codelyzer",
      "karma-coverage-istanbul-reporter", "@types/jasminewd2",
      "jasmine-spec-reporter", "scss-bundle", "ng-packagr",
      "@progress/kendo-angular-schematics",
    ],
    "__remove_overrides__": [
      "loader-utils", "webpack", "xmlhttprequest-ssl", "tough-cookie",
      "form-data", "socket.io-parser", "ip",
    ],
    "__remove_pinned__": [
      "loader-utils", "webpack", "xmlhttprequest-ssl", "tough-cookie",
      "form-data", "socket.io-parser", "ip",
    ],
  },
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

// fixes angular.json for ng17+ application builder
function fixAngularJson() {
  var aj = readAngularJson();
  if (!aj) {
    console.log("  no angular.json, skipping");
    return false;
  }

  var changed = false;
  var changes = [];

  var deprecatedOpts = [
    "extractCss", "vendorChunk", "commonChunk", "buildOptimizer",
    "es5BrowserSupport", "deployUrl", "aot", "namedChunks",
  ];

  var renameOpts = { "main": "browser", "browserTarget": "buildTarget" };
  var arrayOpts = ["polyfills"];
  var deprecatedBuilders = [
    "@angular-devkit/build-angular:tslint",
    "@angular-devkit/build-angular:protractor",
  ];

  if (aj.defaultProject !== undefined) {
    delete aj.defaultProject;
    changed = true;
    changes.push("removed defaultProject");
  }

  if (aj.projects) {
    Object.keys(aj.projects).forEach(function (proj) {
      var p = aj.projects[proj];
      if (!p.architect) return;

      var toRemove = [];
      Object.keys(p.architect).forEach(function (tgt) {
        var t = p.architect[tgt];

        if (t.builder && deprecatedBuilders.indexOf(t.builder) !== -1) {
          toRemove.push(tgt);
          changes.push(proj + "." + tgt + ": removed (deprecated)");
          return;
        }

        if (t.builder === "@angular-devkit/build-angular:browser") {
          t.builder = "@angular-devkit/build-angular:application";
          changed = true;
          changes.push(proj + "." + tgt + ": browser -> application");
        }

        if (t.options) {
          deprecatedOpts.forEach(function (opt) {
            if (t.options[opt] !== undefined) {
              delete t.options[opt];
              changed = true;
              changes.push(proj + "." + tgt + ": removed " + opt);
            }
          });
          Object.keys(renameOpts).forEach(function (old) {
            if (t.options[old] !== undefined) {
              t.options[renameOpts[old]] = t.options[old];
              delete t.options[old];
              changed = true;
              changes.push(proj + "." + tgt + ": " + old + " -> " + renameOpts[old]);
            }
          });
          arrayOpts.forEach(function (opt) {
            if (t.options[opt] !== undefined && typeof t.options[opt] === "string") {
              t.options[opt] = [t.options[opt]];
              changed = true;
              changes.push(proj + "." + tgt + ": " + opt + " to array");
            }
          });
        }

        if (t.configurations) {
          Object.keys(t.configurations).forEach(function (cfg) {
            var c = t.configurations[cfg];
            deprecatedOpts.forEach(function (opt) {
              if (c[opt] !== undefined) {
                delete c[opt];
                changed = true;
              }
            });
            Object.keys(renameOpts).forEach(function (old) {
              if (c[old] !== undefined) {
                c[renameOpts[old]] = c[old];
                delete c[old];
                changed = true;
              }
            });
            arrayOpts.forEach(function (opt) {
              if (c[opt] !== undefined && typeof c[opt] === "string") {
                c[opt] = [c[opt]];
                changed = true;
              }
            });
          });
        }
      });

      toRemove.forEach(function (tgt) {
        delete p.architect[tgt];
        changed = true;
      });
    });
  }

  if (changed) {
    writeAngularJson(aj);
    console.log("\n  angular.json fixes:");
    changes.forEach(function (c) { console.log("    " + c); });
  }
  return changed;
}

function detectAngularVersion() {
  var pkg = readPkgJson();
  var deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  var v = deps["@angular/core"];
  if (!v) { console.error("no @angular/core found"); process.exit(1); }
  var m = v.replace(/^[\^~>=<\s]+/, "").match(/^(\d+)/);
  if (!m) { console.error("cant parse angular version: " + v); process.exit(1); }
  return +m[1];
}

function getNpmVersion() {
  try { return spawnSync("npm", ["--version"], { encoding: "utf8", shell: true }).stdout.trim(); }
  catch (_) { return "?"; }
}

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
  var stable = versions.filter(function (v) { return parseSemver(v); }).sort(compareSemver);
  var exact = stable.find(function (v) { return v === clean; });
  if (exact) return exact;
  var sameMajGe = stable.filter(function (v) { var p = parseSemver(v); return p.major === target.major && compareSemver(v, clean) >= 0; });
  if (sameMajGe.length) return sameMajGe[0];
  var sameMaj = stable.filter(function (v) { return parseSemver(v).major === target.major; });
  if (sameMaj.length) return sameMaj[sameMaj.length - 1];
  var higher = stable.filter(function (v) { return compareSemver(v, clean) >= 0; });
  if (higher.length) return higher[0];
  return stable[stable.length - 1];
}

function getAllVersions(name, verbose) {
  if (verbose) console.log("    > npm view " + name + " versions");
  var r = spawnSync("npm", ["view", "--json", name, "versions"], { encoding: "utf8", timeout: 60000, shell: true });
  if (r.status !== 0) return null;
  try {
    var p = JSON.parse(r.stdout.trim());
    var vers = typeof p === "string" ? [p] : Array.isArray(p) ? p : null;
    if (verbose && vers) console.log("    found " + vers.length + " versions");
    return vers;
  } catch (_) { return null; }
}

function getLatestVersion(name, verbose) {
  if (verbose) console.log("    > npm view " + name + " version");
  var r = spawnSync("npm", ["view", "--json", name, "version"], { encoding: "utf8", timeout: 60000, shell: true });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout.trim()); } catch (_) { return null; }
}

function resolveVersion(name, wanted, verbose) {
  if (wanted === "latest") {
    var latest = getLatestVersion(name, verbose);
    if (latest) {
      console.log("    " + name + ": latest -> " + latest);
      return latest;
    }
    console.log("    warning: cant resolve latest for " + name);
    return wanted;
  }
  var vers = getAllVersions(name, verbose);
  if (!vers || !vers.length) {
    console.log("    warning: " + name + " not in registry");
    return wanted;
  }
  var picked = findBestVersion(vers, wanted);
  var wantedClean = wanted.replace(/^[\^~>=<\s]+/, "");
  if (picked !== wantedClean) {
    console.log("    " + name + ": " + wanted + " -> " + picked);
  } else if (verbose) {
    console.log("    " + name + ": " + wanted + " (ok)");
  }
  return picked;
}

function analyzeProject(angularMajor) {
  var compat = COMPAT[angularMajor];
  if (!compat) {
    console.log("  no compat data for angular " + angularMajor);
    console.log("  supported: " + Object.keys(COMPAT).join(", "));
    process.exit(1);
  }

  var pkg = readPkgJson();
  var deps = pkg.dependencies || {};
  var devDeps = pkg.devDependencies || {};
  var allDeps = Object.assign({}, deps, devDeps);

  var updates = [];
  var removals = [];
  var kendoUpdates = [];

  var explicitKendo = Object.keys(compat).filter(function (n) {
    return n.indexOf("@progress/kendo-angular-") === 0 && n !== "@progress/kendo-angular-*";
  });
  var toRemove = (compat["__remove__"] || []).concat(compat["__remove_pinned__"] || [], compat["__remove_overrides__"] || []);

  Object.keys(compat).forEach(function (name) {
    if (name === "__remove__" || name === "__remove_overrides__" || name === "__remove_pinned__") return;
    var target = compat[name];

    if (name === "@progress/kendo-angular-*") {
      Object.keys(allDeps).forEach(function (dep) {
        if (dep.indexOf("@progress/kendo-angular-") === 0) {
          if (explicitKendo.indexOf(dep) !== -1) return;
          if (toRemove.indexOf(dep) !== -1) return;
          var curr = allDeps[dep];
          var sec = deps[dep] ? "dependencies" : "devDependencies";
          if (curr.replace(/^[\^~>=<\s]+/, "") !== target.replace(/^[\^~>=<\s]+/, "")) {
            kendoUpdates.push({ name: dep, from: curr, to: target, section: sec });
          }
        }
      });
      return;
    }

    if (target === null) {
      if (allDeps[name]) {
        removals.push({ name: name, section: deps[name] ? "dependencies" : "devDependencies" });
      }
      return;
    }

    if (allDeps[name]) {
      var curr = allDeps[name];
      var sec = deps[name] ? "dependencies" : "devDependencies";
      if (curr.replace(/^[\^~>=<\s]+/, "") !== target.replace(/^[\^~>=<\s]+/, "")) {
        updates.push({ name: name, from: curr, to: target, section: sec });
      }
    }
  });

  (compat["__remove__"] || []).forEach(function (name) {
    if (allDeps[name] && !removals.find(function (r) { return r.name === name; })) {
      removals.push({ name: name, section: deps[name] ? "dependencies" : "devDependencies" });
    }
  });

  var pinnedList = compat["__remove_pinned__"] || [];
  var pinnedOverrides = [];
  pinnedList.forEach(function (name) {
    if (allDeps[name]) {
      if (!removals.find(function (r) { return r.name === name; })) {
        removals.push({ name: name, section: deps[name] ? "dependencies" : "devDependencies" });
      }
      pinnedOverrides.push(name);
    }
  });

  var overrideRemovals = [];
  (compat["__remove_overrides__"] || []).forEach(function (name) {
    if (pinnedList.indexOf(name) !== -1) return;
    if (pkg.overrides && pkg.overrides[name]) overrideRemovals.push(name);
  });

  // check if project uses kendo
  var hasKendo = Object.keys(allDeps).some(function (d) {
    return d.indexOf("@progress/kendo-angular-") === 0;
  });

  // check if project uses ng-bootstrap
  var hasNgBootstrap = !!allDeps["@ng-bootstrap/ng-bootstrap"];

  // add missing peer deps
  var additions = [];
  if (hasKendo) {
    var kendoPeers = [
      "@progress/kendo-licensing",
      "@progress/kendo-angular-icons",
      "@progress/kendo-angular-utils",
      "@progress/kendo-angular-navigation",
      "@progress/kendo-svg-icons",
    ];
    kendoPeers.forEach(function (name) {
      if (!allDeps[name] && compat[name]) {
        additions.push({ name: name, to: compat[name], section: "dependencies" });
      }
    });
  }
  if (hasNgBootstrap) {
    if (!allDeps["@popperjs/core"] && compat["@popperjs/core"]) {
      additions.push({ name: "@popperjs/core", to: compat["@popperjs/core"], section: "dependencies" });
    }
  }

  return { updates: updates, kendoUpdates: kendoUpdates, removals: removals, overrideRemovals: overrideRemovals, pinnedOverrides: pinnedOverrides, additions: additions };
}

function applyChanges(analysis, useResolve, verbose) {
  var pkg = readPkgJson();
  var changed = 0;

  function getVersion(name, wanted) {
    if (!useResolve) return wanted;
    var resolved = resolveVersion(name, wanted, verbose);
    if (wanted === "latest") return resolved;
    var prefix = wanted.match(/^[\^~]/);
    return (prefix ? prefix[0] : "") + resolved;
  }

  console.log(useResolve ? "\n  resolving versions..." : "\n  applying versions...");

  analysis.updates.forEach(function (u) {
    if (pkg[u.section] && pkg[u.section][u.name]) {
      pkg[u.section][u.name] = getVersion(u.name, u.to);
      changed++;
    }
  });

  analysis.kendoUpdates.forEach(function (u) {
    if (pkg[u.section] && pkg[u.section][u.name]) {
      pkg[u.section][u.name] = getVersion(u.name, u.to);
      changed++;
    }
  });

  // add missing peer deps
  if (analysis.additions && analysis.additions.length) {
    console.log("\n  adding missing peer deps...");
    analysis.additions.forEach(function (a) {
      if (!pkg[a.section]) pkg[a.section] = {};
      pkg[a.section][a.name] = getVersion(a.name, a.to);
      console.log("    + " + a.name + ": " + a.to);
      changed++;
    });
  }

  analysis.removals.forEach(function (r) {
    if (pkg.dependencies && pkg.dependencies[r.name]) { delete pkg.dependencies[r.name]; changed++; }
    if (pkg.devDependencies && pkg.devDependencies[r.name]) { delete pkg.devDependencies[r.name]; changed++; }
  });

  if (analysis.overrideRemovals && analysis.overrideRemovals.length && pkg.overrides) {
    analysis.overrideRemovals.forEach(function (name) {
      if (pkg.overrides[name]) { delete pkg.overrides[name]; changed++; }
    });
  }

  if (analysis.pinnedOverrides && analysis.pinnedOverrides.length) {
    if (!pkg.overrides) pkg.overrides = {};
    console.log("\n  resolving overrides for transitive deps...");
    analysis.pinnedOverrides.forEach(function (name) {
      var resolved = resolveVersion(name, "latest", verbose);
      if (resolved && resolved !== "latest") {
        pkg.overrides[name] = resolved;
        console.log("    " + name + " -> " + resolved);
        changed++;
      }
    });
  }

  if (pkg.overrides && Object.keys(pkg.overrides).length === 0) delete pkg.overrides;

  writePkgJson(pkg);
  return changed;
}

function cleanBeforeInstall() {
  console.log("\n  cleaning...");
  if (fs.existsSync("package-lock.json")) {
    fs.unlinkSync("package-lock.json");
    console.log("    deleted package-lock.json");
  }
  if (fs.existsSync("node_modules")) {
    console.log("    deleting node_modules...");
    var isWin = process.platform === "win32";
    var res = isWin
      ? spawnSync("cmd", ["/c", "rmdir", "/s", "/q", "node_modules"], { stdio: "inherit", shell: true })
      : spawnSync("rm", ["-rf", "node_modules"], { stdio: "inherit", shell: true });
    if (res.status === 0) console.log("    done");
  }
}

function runNpmInstall() {
  cleanBeforeInstall();
  console.log("\n  npm install --force --legacy-peer-deps --omit=optional\n");
  var res = spawnSync("npm", ["install", "--force", "--legacy-peer-deps", "--omit=optional"], {
    stdio: "inherit", shell: true, timeout: 600000, cwd: process.cwd()
  });
  return res.status === 0;
}

function printReport(analysis, angularMajor) {
  var total = analysis.updates.length + analysis.kendoUpdates.length + analysis.removals.length +
    (analysis.overrideRemovals || []).length + (analysis.pinnedOverrides || []).length +
    (analysis.additions || []).length;

  if (total === 0) {
    console.log("\n  deps look ok for angular " + angularMajor);
    return;
  }

  console.log("\n  found " + total + " issue(s):\n");

  if (analysis.updates.length) {
    console.log("  updates:");
    analysis.updates.forEach(function (u) { console.log("    " + u.name + ": " + u.from + " -> " + u.to); });
  }
  if (analysis.kendoUpdates.length) {
    console.log("\n  kendo (" + analysis.kendoUpdates.length + " packages):");
    analysis.kendoUpdates.forEach(function (u) { console.log("    " + u.name + ": " + u.from + " -> " + u.to); });
  }
  if ((analysis.additions || []).length) {
    console.log("\n  missing peer deps to add:");
    analysis.additions.forEach(function (a) { console.log("    " + a.name + ": " + a.to); });
  }
  if (analysis.removals.length) {
    console.log("\n  removals:");
    analysis.removals.forEach(function (r) { console.log("    " + r.name); });
  }
  if ((analysis.pinnedOverrides || []).length) {
    console.log("\n  pinned -> overrides:");
    analysis.pinnedOverrides.forEach(function (n) { console.log("    " + n); });
  }
}

function main() {
  console.log("fix-deps v14\n");

  if (!fs.existsSync("package.json")) {
    console.error("no package.json found");
    process.exit(1);
  }

  var angularMajor = detectAngularVersion();
  console.log("  angular " + angularMajor + ", node " + process.version + ", npm " + getNpmVersion());

  if (process.argv.includes("--help")) {
    console.log("\nusage:");
    console.log("  node fix-deps.js           dry run");
    console.log("  node fix-deps.js --yes     apply + install");
    console.log("  node fix-deps.js --update  apply only");
    console.log("  --no-resolve               skip registry check");
    console.log("  --quiet                    less output");
    process.exit(0);
  }

  var analysis = analyzeProject(angularMajor);
  printReport(analysis, angularMajor);

  var total = analysis.updates.length + analysis.kendoUpdates.length + analysis.removals.length +
    (analysis.overrideRemovals || []).length + (analysis.pinnedOverrides || []).length +
    (analysis.additions || []).length;

  var doApply = process.argv.includes("--yes") || process.argv.includes("--update");
  var doInstall = process.argv.includes("--yes");
  var doResolve = !process.argv.includes("--no-resolve");
  var doVerbose = !process.argv.includes("--quiet");

  var ajChanged = false;
  if (doApply) ajChanged = fixAngularJson();

  if (total === 0 && !ajChanged) {
    console.log("\n  nothing to do");
    process.exit(0);
  }

  if (!doApply) {
    console.log("\n  dry run. use --yes to apply");
    process.exit(0);
  }

  if (total > 0) {
    console.log("\n  updating package.json...");
    var changed = applyChanges(analysis, doResolve, doVerbose);
    console.log("  updated " + changed + " entries");
  }

  if (doInstall) {
    var ok = runNpmInstall();
    if (!ok) {
      console.error("\n  npm install failed");
      process.exit(1);
    }
    console.log("\n  done. run ng build to check");
  } else {
    console.log("\n  package.json updated. run npm install when ready");
  }

  console.log("\n  notes:");
  console.log("  - kendo may have breaking changes, check changelog");
  console.log("  - ng-bootstrap needs bootstrap 5.3+");
  console.log("  - tslint -> eslint, protractor -> cypress/playwright");
}

main();
