var config = require('./config.js')
var utils = require('./utils.js')
var request = require('request')
var log = require('logatim')
var oldTime = +new Date
var _ = require('lodash')
var send = utils.send
log.setLevel('info')
var LEN = 100
var info = {}

function updateInfo() {
  utils.send({
    method: 'get_account_info'
  }, function (data) {
    if (!data.code) {
      info = data
      // console.log(info)
    }
  })
}

var lastPrice = null

function getStat() {
  utils.stat(function (stat) {
    var newTime = +new Date
    if (!stat.p_new) {
      log.red('Timeout: Fuck').debug()
    } else {
      log.green('---> Get Price: ' + stat.p_new.toFixed(2))
        .blue('\tDELAY: ' + (newTime - oldTime))
        .debug()
      oldTime = newTime
      if (stat.p_new !== lastPrice) {
        lastPrice = stat.p_new
        stats.push(lastPrice)
        log.yellow('New Price: ' + lastPrice).debug()
        if (stats.length >= LEN) {
          trade()
          stats.shift()
        }
      }
    }
    getStat()
  })
}

function init () {
  getStat()
}

var stats = []
function trade () {
  diff()
  updateInfo()
}

function diff () {
  var prev = stats[0]
  var dists = []
  var longDist = 0
  stats.forEach(function (price, i) {
    if (i === 0) return
    var dist = price - prev
    dists.push(dist)
    longDist += dist
    prev = price
  })
  buyOrSell(longDist)
}

var flyingIndex = 0
var descentingIndex = 0
var hasBought = false
var oldLongDist = 0
var longDists = []

function buyOrSell(longDist) {
  if (!oldLongDist) {
    oldLongDist = longDist
    return
  }
  var padding = longDist - oldLongDist
  longDists.push(padding)
  console.log(longDists)
  var THRESHOLD = 3
  // if (isFading()) sell()
  // else buy()
  // keep it small
  if (longDists.length >= LEN) {
    longDists.shift()
  }
}

var oldAvg = null
var fadeCount = 0
var fadeStack = 10
function isFading () {
  var avg = 0
  for (var i = 0; i < 10; i++) {
    avg += longDists[longDists.length - i - 1]
  }
  // console.log(longDists, avg, oldAvg)
  if (!oldAvg || !avg) {
    isFaded = true
  } else {
    if (avg - oldAvg < 0) { fadeCount++ } else { fadeCount-- }
    if (fadeCount > fadeStack) { fadeCount = fadeStack } else if (fadeCount < 0) { fadeCount = 0 }
    if (fadeCount >= fadeStack) { isFaded = true } else { isFaded = false }
  }
  oldAvg = avg
  return isFaded
}

function sell () {
  if (hasBought) {
    log.yellow('Sell In: ' + _.last(stats)).info()
    // utils.sellAll(info, function (data) {
    //   if (!data.code) {
    //     console.log(data)
    //   }
    // })
    hasBought = false
  }
}

function buy () {
  if (!hasBought) {
    log.blue('Bug In: ' + _.last(stats)).info()
    // utils.buy(200, function (data) {
    //   if (!data.code) {
    //     console.log(data)
    //   }
    // })
    hasBought = true
  }
}

init()