"use strict";
var _ = require("lodash")
var s = require("util").format

var FIELDS_LOOKUPS = "fields=" +
                     "count," +
                     "build(id,buildTypeId,branchName,href,queuedDate,properties(property)," +
                     "triggered(user(username,name)))"

exports.allQueuedBuilds = function () {
  var tail = "httpAuth/app/rest/buildQueue"
  var url = s("%s?%s", tail, FIELDS_LOOKUPS)
  return this.get(url)
    .then(function (body) {
      return body.build || []
    })
}

exports.allRunningBuilds = function () {
  var href = "httpAuth/app/rest/builds"
  var locator = "locator=branch:default:any,running:true"
  var url = s("%s?%s&%s", href, locator, FIELDS_LOOKUPS)
  return this.get(url)
    .then(function (body) {
      return body.build || []
    })
}

exports.build = function (buildId) {
  var href = s("httpAuth/app/rest/builds/id:%s", buildId)
  return this.get(href)
}

exports.buildConfiguration = function (typeId) {
  var href = s("httpAuth/app/rest/buildTypes/id:%s", typeId)
  return this.get(href)
}

exports.queuedBuilds = function (buildId, branchName) {
  var needle = {
    "buildTypeId": buildId,
    "branchName": branchName
  }
  return this.lookup.allQueuedBuilds()
    .then(function (builds) {
      return _.filter(builds, needle)
    })
}

exports.runningBuilds = function (buildId, branchName) {
  var needle = {
    "buildTypeId": buildId,
    "branchName": branchName
  }
  return this.lookup.allRunningBuilds()
    .then(function (builds) {
      return _.filter(builds, needle)
    })
}

