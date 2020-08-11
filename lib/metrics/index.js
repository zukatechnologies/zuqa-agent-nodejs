'use strict'

const MetricsRegistry = require('./registry')

const registrySymbol = Symbol('metrics-registry')
const agentSymbol = Symbol('metrics-agent')
const fetch = require('node-fetch')

let metricArr

class NoopLogger {
  debug () { }
  error () { }
  fatal () { }
  info () { }
  trace () { }
  warn () { }
}

class Metrics {
  constructor (agent) {
    this[agentSymbol] = agent
    this[registrySymbol] = null
  }

  start (refTimers) {
    metricArr = []
    const metricsInterval = this[agentSymbol]._conf.metricsInterval
    this[registrySymbol] = new MetricsRegistry(this[agentSymbol], metricArr, {
      reporterOptions: {
        defaultReportingIntervalInSeconds: metricsInterval,
        enabled: metricsInterval !== 0,
        unrefTimers: !refTimers,
        logger: new NoopLogger()
      }
    })
  }

  stop (req) {
    if (this[registrySymbol]) {
      this[registrySymbol].shutdown()
      this[registrySymbol] = null
      this.sendMetricsDataToApm(metricArr, req)
    }
  }

  async sendMetricsDataToApm (metricArr, req) {
    const data = {
      url: req.url,
      metricset: JSON.stringify(metricArr)
    }
    const url = 'http://0.0.0.0:8200/v1/metrics/save'
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    })
    response.json().then((data) => {
      // todo logic for keeping metrics data if not sent to apm server
    })
  }

  getOrCreateCounter (...args) {
    return this[registrySymbol].getOrCreateCounter(...args)
  }

  incrementCounter (name, dimensions, amount = 1) {
    if (!this[registrySymbol]) {
      return
    }

    this.getOrCreateCounter(name, dimensions).inc(amount)
  }

  getOrCreateGauge (...args) {
    return this[registrySymbol].getOrCreateGauge(...args)
  }
}

module.exports = Metrics
