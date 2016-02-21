var config = require('./config.js')
var utils = require('./utils.js')
var request = require('request')

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

function getStat() {
  utils.stat(function (stat) {
    if (!stat.p_new) {
      console.log('timeout: Fuck');
    } else {
      console.log(stat.p_new)
    }
    getStat()
  })
}


getStat()

