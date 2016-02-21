var config = require('./config.js')
var utils = require('./utils.js')
var request = require('request')
var log = require('logatim')

utils.send({
  method: 'get_account_info'
}, function (data) {
  console.log(data)
})

utils.send({
  method: 'get_orders',
  coin_type: 1
}, function (data) {
  console.log(data)
})

utils.send({
  method: 'get_new_deal_orders'
}, function (data) {
  console.log(data)
})

var oldTime = +new Date
function getStat() {
  utils.stat(function (stat) {
    var newTime = +new Date
    log.setLevel('debug')
    log.blue('DELAY: ' + (newTime - oldTime)).info()
    oldTime = newTime
    if (!stat.p_new) {
      log.red.error('Timeout: Fuck')
    } else {
      console.log(stat.p_new)
    }
    getStat()
  })
}


getStat()

