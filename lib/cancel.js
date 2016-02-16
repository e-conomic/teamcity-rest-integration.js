"use strict";
var s = require("util").format

var DEFAULT_CANCEL_REASON = "Cancel called from Teamcitybot"
var FIELDS_BASIC = "id," +
                   "buildTypeId," +
                   "state," +
                   "branchName," +
                   "webUrl," +
                   "buildType(name,description)," +
                   "canceledInfo," +
                   "queuedDate," +
                   "startDate," +
                   "finishDate," +
                   "properties(count,property)"

var FIELDS_REVISIONS = "revisions(count,revision(version,vcs-root-instance(name,href)))"

var FIELDS_ALL = s("%s,%s", FIELDS_BASIC, FIELDS_REVISIONS)

var FIELDS_ALLDEPS = s("%s,snapshot-dependencies(count,build(%s))", FIELDS_ALL,
                       FIELDS_ALL)

exports.stopBuild = function (typeId, reason) {
  var self = this
  var payload = {
    url: s("httpAuth/app/rest/builds/id:%s?%s", typeId, FIELDS_ALLDEPS),
    body: {
      comment: reason || DEFAULT_CANCEL_REASON,
      readdIntoQueue: false
    }
  }
  return this.post(payload)
    .then(function (result) {
      return self.get(result.href) // POST result is missing revisions field
    })
}

exports.removeBuild = function (typeId, reason) {
  var self = this
  var payload = {
    url: s("httpAuth/app/rest/buildQueue/id:%s?%s", typeId, FIELDS_ALLDEPS),
    body: {
      comment: reason || DEFAULT_CANCEL_REASON,
      readdIntoQueue: false
    }
  }
  return this.post(payload)
    .then(function (result) {
      return self.get(result.href) // POST result is missing revisions field
    })
}
