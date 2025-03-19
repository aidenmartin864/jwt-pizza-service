const config = require('./config');
const os = require('os');

sendMetricsPeriodically(1000);

const requests = {};

function track(endpoint) {
  return (req, res, next) => {
    requests[endpoint] = (requests[endpoint] || 0) + 1;
    next();
  };
}

function sendMetricToGrafana(metricName, metricValue, attributes) {
  attributes = { ...attributes, source: config.metrics.source };

  const metric = {
    resourceMetrics: [
      {
        scopeMetrics: [
          {
            metrics: [
              {
                name: metricName,
                unit: '1',
                sum: {
                  dataPoints: [
                    {
                      asDouble: metricValue,
                      timeUnixNano: Date.now() * 1000000,
                      attributes: [],
                    },
                  ],
                  aggregationTemporality: 'AGGREGATION_TEMPORALITY_CUMULATIVE',
                  isMonotonic: true,
                },
              },
            ],
          },
        ],
      },
    ],
  };

  Object.keys(attributes).forEach((key) => {
    metric.resourceMetrics[0].scopeMetrics[0].metrics[0].sum.dataPoints[0].attributes.push({
      key: key,
      value: { stringValue: attributes[key] },
    });
  });

  fetch(`${config.metrics.url}`, {
    method: 'POST',
    body: JSON.stringify(metric),
    headers: { Authorization: `Bearer ${config.metrics.apiKey}`, 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        console.error('Failed to push metrics data to Grafana');
      } else {
        console.log(`Pushed ${metricName}`);
      }
    })
    .catch((error) => {
      console.error('Error pushing metrics:', error);
    });
}

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

function httpMetrics() {
    Object.keys(requests).forEach((endpoint) => {
        sendMetricToGrafana('requests', requests[endpoint], { endpoint });
    });
}

function systemMetrics() {
    sendMetricToGrafana('CPU', getCpuUsagePercentage(), 'gauge', '%');
    sendMetricToGrafana('Memory', getMemoryUsagePercentage(), 'gauge', '%');
}

function userMetrics() {
    //Implement
}

function purchaseMetrics() {
    //Implement
}

function authMetrics() {
    //Implement
}

function sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        httpMetrics();
        systemMetrics();
        userMetrics();
        purchaseMetrics();
        authMetrics();
      } catch (error) {
        console.log('Error sending metrics', error);
      }
    }, period);
}

module.exports = { track };
