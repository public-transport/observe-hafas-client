const createHafasClient = require('hafas-client')
const vbbProfile = require('hafas-client/p/vbb')
const {EventEmitter} = require('events')
const observe = require('.')

const hafas = createHafasClient(vbbProfile, 'observe-hafas-client example')

// set up observing
const observer = new EventEmitter()
observer.on('departure', dep => console.log(dep.when))
const observedHafas = observe(hafas, observer, {departures: true})

// query data from HAFAS
observedHafas.departures('900000100001') // Berlin Friedrichstr.
.then(() => {}, console.error)
