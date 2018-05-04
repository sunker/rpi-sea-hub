const mongo = require('./models/mongo.js')

module.exports = (gpsdClient) => {
  let coordinates = []
  gpsdClient.on('coordinate', (coord) => coordinates.push(coord))

  setInterval(function () {
    if (coordinates.length > 0) {
      console.log('Add coordnates. Length: ', coordinates.length)
      const doc = coordinates[0]
      doc.speed = (coordinates.map(x => Number(x.speed || 0)).reduce((total, obj) => {
        total = total + obj
        return total
      }, 0) / coordinates.length).toFixed(2)
      console.log('Average speed: ', doc.speed)
      // if (doc.speed > 0.1) {
      const d = new Date()
      doc.createdAt = d.getTime()
      doc.expiresAt = Date.now() + (1000 * 86400 * 3)
      if (mongo.coordinates) {
        mongo.coordinates.insert(doc, function (err) {
          if (err) console.log('error at mongo insert telemetry', err)
          else console.log('Stored in db. Speed', doc.speed)
        })
      }
      // }
      coordinates = []
    }
  }, 6000)
}