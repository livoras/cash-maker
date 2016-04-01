'use strict'

const data = require('./btcoin.json')

// 日开高低收量
const days = data.map((day) => [day[4], day[1]])

function check (prev, day) {
    const money = prev[0]
    const amount = prev[1]
    const move = prev[2]
    const boughtDays = prev[3]

    const sellIt = sellByPrice(day[0])
    const buyIt = buyByPrice(day[1])
    const currentMove = makeMove(day)
    const newBoughtDays = boughtDays
        ? boughtDays + 1
        : 0

    if (boughtDays >= 1) {
        return [
            money + sell(amount, day[0]),
            0,
            makeMove(day),
            0
        ]
    } else if (move <= -5) {
        return [
            0,
            amount + buy(money, day[1]),
            makeMove(day),
            1
        ]
    } else {
        return [
            money,
            amount,
            nextMove(currentMove, move),
            newBoughtDays
        ]
    }
}

function nextMove (currentMove, prevMove) {
    return (currentMove * prevMove < 0)
        ? currentMove
        : currentMove + prevMove 
}

function perfect (prev, day) {
    const money = prev[0]
    const amount = prev[1]
    const sellIt = sellByPrice(day[0])
    const buyIt = buyByPrice(day[1])
    // console.log('MONEY: ' + prev[0], 'COINS: ' + prev[1])
    if (Math.random() < 0.618) {
        if (money === 0) {
            return [sellIt(amount), 0]
        } else if (amount === 0) {
            return [0, buyIt(money)]
        }
    } else {
        return prev
    }
}

function makeMove (day) {
    return day[0] - day[1] > 0
        ? 1
        : -1
}

function getMoney (arr, sell) {
    return arr[0] || sell(arr[1])
}

function range (from, to) {
    return function (f) {
        var ret = []
        var i = from
        var end = to
        while (i++ < to) {
            ret.push(f(from))
        }
        return ret
    }
}

function buy (money, price) {
    return (money / price).toFixed(2) * 1
}

function sell (amount, price) {
    return (amount * price).toFixed(2) * 1
}

function trade (days, money, strategy, init) {
    return days.reduce(strategy, init)
}

function sellByPrice (price) {
    return function (amount) {
        return sell(amount, price)
    }
}

function buyByPrice (price) {
    return function (money) {
        return buy(money, price)
    }
}

const sellFinal = sellByPrice(days[999][1])
const MONEY = 10000

function run1 () {
    var ret = trade(randomDays(), MONEY, check, [MONEY, 0, 0, 0])
    return getMoney(ret, sellFinal)
}

function randomDays () {
    // const DAYS = 300
    const start = random(days.length)
    const end = start + random(days.length - start)
    // console.log(start, end)
    // return days
    return days.slice(start, end)
}

function random (len) {
    return Math.floor(Math.random() * len)
}

function run2 () {
    var ret = trade(randomDays(), MONEY, perfect, [MONEY, 0])
    return getMoney(ret, sellFinal)
}

function collect (rets) {
    console.log(
        Math.max.apply(Math.max, rets),
        Math.min.apply(Math.min, rets),
        average(rets))
    return rets.reduce(checkRet, [0, 0])
}

function average (nums) {
    return (nums.reduce((sum, num) => sum + num, 0) / nums.length).toFixed(2) * 1
}

function checkRet (prev, ret) {
    const arr = ret > MONEY
        ? [prev[0] + 1, prev[1]]
        : [prev[0], prev[1] + 1]
    return arr
}

function rate (ret) {
    return ((ret[0] / (ret[0] + ret[1])) * 100).toFixed(2) + '%'
}

function benchmark (f) {
    const test = range(1, 10000)
    console.log(rate(collect(test(f))))
    console.log('===============================')
}

benchmark(run1)
benchmark(run2)
