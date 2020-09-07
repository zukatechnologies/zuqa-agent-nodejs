'use strict'

const afterAll = require('after-all-results')
const { Reporter } = require('measured-reporting')
const ObjectIdentityMap = require('object-identity-map')

class MetricsReporter extends Reporter {
  constructor (agent, options = {}) {
    super(options)
    this.enabled = options.enabled
    this._agent = agent
    this.metricArray = []
    if (!this.enabled) {
      this.shutdown()
    }
  }

  _reportMetrics (metrics) {
    if (!this.enabled) return

    const baseDimensions = {
      timestamp: Date.now() * 1000,
      tags: this._getDimensions(metrics)
    }

    const next = afterAll(() => {
      const seen = new ObjectIdentityMap()
      let data
      for (const metric of metrics) {
        // Due to limitations in measured-reporting, metrics dropped
        // due to `metricsLimit` leave empty slots in the list.
        if (!metric) continue
        data = seen.ensure(metric.dimensions, () => {
          const metricData = unflattenBreakdown(metric.dimensions)
          const merged = Object.assign({ samples: {} }, baseDimensions, metricData)
          Object.assign(merged.tags, baseDimensions.tags, metricData.tags)
          return merged
        })

        data.samples[metric.name] = {
          value: metric.metricImpl.toJSON()
        }

        if (metric.metricImpl.constructor.name === 'Counter') {
          metric.metricImpl.reset()
        }
      }

      if (this._agent.collectActively) {
        if (Object.keys(data.samples).length > 3) {
          this.metricArray.push(data)
        }
      } else if (this.metricArray.length > 0) {
        this._agent._transport.sendTransactionMetricSet({
          url: this._agent.lastTransactionName,
          metricsets: this.metricArray
        })
        this.metricArray = []
      }
    })

    for (const collector of this._registry.collectors) {
      collector.collect(next())
    }
  }
}

module.exports = MetricsReporter

function unflattenBreakdown (source) {
  const target = {
    tags: {}
  }

  for (const [key, value] of Object.entries(source)) {
    if (key.includes('::')) {
      const [parent, child] = key.split('::')
      if (!target[parent]) target[parent] = {}
      target[parent][child] = value
    } else {
      target.tags[key] = value
    }
  }

  return target
}
