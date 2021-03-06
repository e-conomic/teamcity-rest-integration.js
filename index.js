"use strict";
var EventEmitter = require("events").EventEmitter
var _ = require("lodash")
var Q = require("q")
var request = require("request")
var url = require("url")
var util = require("util")

/**
 * @param {String} opts.user
 * @param {String} opts.password
 * @param {String} opts.url for teamcity server, e.g. `https://teamcity:123`
 * @constructor
 */
var Manager = function (opts) {
  this.requester = requester(opts.url, opts.user, opts.password)
  var eventEmitter = new EventEmitter()
  this.emit = eventEmitter.emit.bind(eventEmitter)
  this.on = eventEmitter.on.bind(eventEmitter)
}

Manager.prototype.get = function (href) {
  var self = this
  return Q.Promise(function (resolve, reject) {
    self.requester.get(href, function (err, res, body) {
      if (!err && res.statusCode != 200) err = body || "bad response"
      if (err && !util.isError(err)) err = new Error(err)
      if (err) return reject(err)
      resolve(body)
    })
  })
}

Manager.prototype.post = function (payload) {
  var self = this
  return Q.Promise(function (resolve, reject) {
    self.requester.post(payload, function (err, res, body) {
      if (!err && res.statusCode != 200) err = body || "bad response"
      if (err && !util.isError(err)) err = new Error(err)
      if (err) return reject(err)
      resolve(body)
    })
  })
}

var extensions = [
  {prefix: "add", module: require("./lib/add")},
  {prefix: "cancel", module: require("./lib/cancel")},
  {prefix: "lookup", module: require("./lib/lookup")},
  {prefix: "resolve", module: require("./lib/resolve")}
]
extensions.forEach(function (data) {
  var prefix = data.prefix
  var module = data.module
  Object.defineProperty(Manager.prototype, prefix, {
    get: function () {
      var self = this
      var propertyName = "_" + prefix
      if (!self[propertyName]) {
        self.emit("registered", data.prefix)
        self[propertyName] = {}
        for (var name in module) {
          var func = module[name]
          if (_.isFunction(func))
            self[propertyName][name] = func.bind(self)
          else
            self[propertyName][name] = func
        }
      }
      return self[propertyName]
    },
    enumerable: false,
    configurable: true
  })
})

var requester = function (baseUrl, user, password) {
  var uri = url.parse(baseUrl)
  uri.auth = util.format("%s:%s", user, password)
  return request.defaults(
    {
      baseUrl: url.format(uri), json: true,
      rejectUnauthorized: false
    })
}

module.exports = Manager
