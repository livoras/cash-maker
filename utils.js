var config = require('./config.js')
var request = require('request')
var crypto = require('crypto')
var _ = require('lodash')
var log = require('logatim')

function sign (params) {
  var hash = crypto.createHash('md5')
  var keys = []
  for (var key in params) {
    keys.push(key)
  }
  keys.sort(function (key1, key2) {
    return key1.localeCompare(key2)
  })
  var str = ''
  keys.forEach(function (key) {
    if (str.length !== 0) str += '&'
    str = str + key + '=' + params[key]
  })
  hash.update(str)
  return hash.digest('hex')
}

function send (params, extra, callback) {
  if (arguments.length === 2) {
    callback = extra
    extra = {}
  }
  var timestamp = Math.floor((+new Date) / 1000)
  params['created'] = timestamp
  params['access_key'] = config.ACCESS_KEY
  params['secret_key'] = config.SECRET_KEY
  params['sign'] = sign(params)
  request.post(config.URL, {form: _.extend(params, extra)}, function (err, res, body) {
    try {
      var data = JSON.parse(body)
    } catch(e) {
      data = {}
    }
    callback && callback(data)
  })
}

function stat (callback) {
  request.get('http://api.huobi.com/staticmarket/detail_btc_json.js', {timeout: 2000}, function (err, res, body) {
    try {
      var data = JSON.parse(body)
    } catch(e) {
      data = {code: 400, msg: 'JSON解析错误或者超时'}
    }
    if (data.code) {
      log.red('Error: ' + data.msg).error()
    }
    callback(data)
  })
}

exports.sellAll = function (info, callback) {
  send({
    method: 'sell_market',
    coin_type: 1,
    amount: info.available_btc_display
  }, callback)
}

exports.buy = function (money, callback) {
  send({
    method: 'buy_market',
    coin_type: 1,
    amount: money
  }, callback)
}

exports.buyAll = function (info, callback) {
  exports.buy(info.available_cny_display, callback)
}

exports.getOrders = function (callback) {
  send({
    method: 'get_orders',
    coin_type: 1
  }, callback)
}

exports.stat = stat
exports.sign = sign
exports.send = send
