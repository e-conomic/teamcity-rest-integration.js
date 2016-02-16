"use strict";
var _ = require("lodash")
var Q = require("q")

exports.dependencies = function (builds) {
  return Q.all(builds.map(getDependencies))
    .then(_.flatten)
}

exports.vcsRoots = function (builds) {
  var self = this
  return Q.all(builds.map(safeGetVcsHrefs))
    .then(_.flatten)
    .then(function (hrefs) {
      return Q.all(hrefs.map(self.get))
    })
}

var safeGetVcsHrefs = function (data) {
  if (!data.revisions || !data.revisions.revision) return Q.resolve([])
  return Q.all(_.map(data.revisions.revision, function (item) {
    return item["vcs-root-instance"].href
  }))
}

var getDependencies = function (conf) {
  var self = this
  var deps = conf["snapshot-dependencies"]
  if (!deps || !deps.build) return Q.resolve([])
  return Q.all(_.map(deps.build, function (dep) {
    return self.get(dep.href)
  }))
}
