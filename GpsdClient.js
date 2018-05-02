const EventEmitter = require('events').EventEmitter
const bleno = require('bleno')
const gpsd = require('node-gpsd')
const Bancroft = require('bancroft')
const { TextEncoder } = require('text-encoding')

module.exports = class GpsdClient extends EventEmitter {
  constructor() {
    super()
    const daemon = new gpsd.Daemon({
      program: 'gpsd',
      device: '/dev/ttyAMA0',
      port: 2947,
      pid: '/tmp/gpsd.pid',
      readOnly: false,
      logger: {
        info: function () { },
        warn: console.warn,
        error: console.error
      }
    })

    const self = this
    daemon.start(function () {
      console.log('Started')

      const bancroft = new Bancroft()

      bancroft.on('connect', () => {
        console.log('GPSD connected')
      })

      bancroft.on('location', function (location) {
        console.log('GPSD location event')
        let { longitude, latitude, timestamp, speed } = location
        speed = (speed * 1.943844492).toFixed(2)
        longitude = longitude.toFixed(5)
        latitude = latitude.toFixed(5)
        self.emit('coordinate', { longitude, latitude, timestamp, speed })
      })

      bancroft.on('satellite', () => { })

      bancroft.on('disconnect', () => {
        console.log('GPSD disconnected. Shutting down...')
        process.exit(1)
      })
    })
  }
}