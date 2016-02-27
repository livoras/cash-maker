var config = require('./config.js')
var utils = require('./utils.js')
var request = require('request')
var log = require('logatim')
var oldTime = +new Date
var _ = require('lodash')
var send = utils.send
log.setLevel('debug')
var info = {}
var stats = []
var testing = false

if (!testing) {
  var LEN = 1000
  var gapToBuy = 4 // 低于 (均线 - gapToBuy) 就去买
  var gapToSell = 2 // 高于 (买入价格 + gapToSell) 就去卖
  var lowerGapToSell = -2 // 亏损了多少就卖
  var TIME_TO_WAIT = 1000 * 15 * 30 // 等 15 分钟再交易
} else {
  var LEN = 10
  var gapToBuy = 0.1 // 低于 (均线 - gapToBuy) 就去买
  var gapToSell = 0.1 // 高于 (买入价格 + gapToSell) 就去卖
  var lowerGapToSell = -0.1 // 亏损了多少就卖
  var TIME_TO_WAIT = 1000// * 15 * 30 // 等 15 分钟再交易
}


function updateInfo() {
  utils.send({
    method: 'get_account_info'
  }, function (data) {
    console.log(data)
    if (!data.code) {
      info = data
      // console.log(info)
    }
  })
}

updateInfo()

var lastPrice = null
var boughtPrice = null
var total = 0
var avgPrice = 0
var lostMoney = false

function getStat() {
  utils.stat(function (stat) {
    if (lostMoney) { // 如果是亏损了，先休息 30 分钟再交易
      log.red('Lost...Waiting : ' + (lastPrice - boughtPrice)).info()
      return setTimeout(function () {
        stats = []
        total = 0
        getStat()
        lostMoney = false
      }, TIME_TO_WAIT)
    }
    var newTime = +new Date
    if (!stat.p_new) {
      // log.red('Timeout: Fuck').debug()
    } else {
      // log.green('---> Get Price: ' + stat.p_new.toFixed(2))
      //   .blue('\tDELAY: ' + (newTime - oldTime))
      //   .debug()
      oldTime = newTime
      if (stat.p_new !== lastPrice) {
        lastPrice = stat.p_new
        stats.push(lastPrice)
        total += lastPrice
        // log.yellow('New Price: ' + lastPrice).debug()
        if (stats.length >= LEN) {
          total -= stats[0]
          stats.shift()
          avgPrice = +(total / stats.length).toFixed(2)
          log.yellow('Average: ' + avgPrice).info()
          trade()
        } else {
          log.yellow('Not enought data, getting...').info()
        }
        // console.log(stats)
      }
    }
    getStat()
  })
}

function init () {
  getStat()
}

var pending = false

function trade () {
  if (pending) return log.yellow('pending....return').info()
  if (hasBtc()) {
    var dist = lastPrice - boughtPrice
    log.blue('Money lastPrice - boughtPrice ').red(dist).info()
    if (dist >= gapToSell || dist <= lowerGapToSell) {
      log.blue('Sell out : ' + lastPrice).info()
      pending = true
      utils.sellAll(info, function (data) {
        pending = false
      })
      if (dist <= lowerGapToSell) {
        lostMoney = true
      }
      updateInfo()
    } else {
      log.yellow('Waiting to sell...').info()
    }
  } else {
    var dist = avgPrice - lastPrice
    log.blue('Money avgPrice - lastPrice ').red(dist).info()
    if (dist >= gapToBuy) {
      log.blue('Buy in : ' + lastPrice).info()
      pending = true
      utils.buyAll(info, function (data) {
        pending = false
      })
      boughtPrice = lastPrice
      updateInfo()
    } else {
      log.yellow('Waiting to buy...').info()
    }
  }
}

function hasBtc() {
  console.log(info.available_btc_display * 1)
  return (info.available_btc_display * 1 !== 0)
}

init()
