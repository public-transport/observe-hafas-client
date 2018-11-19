'use strict'

const test = require('tape')
const {EventEmitter} = require('events')
const createHafasClient = require('hafas-client')
const vbbProfile = require('hafas-client/p/vbb')
const observe = require('.')

const hafasClient = createHafasClient(vbbProfile, 'observe-hafas-client test')

const withMocks = (mocks) => {
	const facade = Object.create(hafasClient)
	Object.assign(facade, mocks)
	return facade
}
const listenFor = (eventName, fn) => {
	const emitter = new EventEmitter()
	emitter.on(eventName, fn)
	return emitter
}

const someStation = {
	type: 'station',
	id: 'station-123',
	name: '123',
	latitude: 1.23,
	longitude: 3.21
}
const someStop = {
	type: 'stop',
	id: 'stop-321',
	name: '321',
	latitude: 3.21,
	longitude: 1.23,
	station: {...someStation}
}
const someLine = {
	type: 'line',
	id: 'line-12',
	name: '12',
	mode: 'train',
	operator: 'operator-1'
}

test('departures', (t) => {
	const dep1 = {
		tripId: 'trip-1234',
		stop: someStop,
		when: '2018-10-25T22:01:00+0200',
		delay: 120,
		line: someLine
	}
	const dep2 = {
		tripId: 'trip-4321',
		stop: someStop,
		when: '2018-10-25T22:02:00+0200',
		delay: null,
		line: someLine
	}
	const hafas = withMocks({
		departures: (stationId, opt = {}) => Promise.resolve([dep1, dep2])
	})

	t.plan(2 * 6)
	let i = 0
	const emitter = listenFor('departure', (dep) => {
		const expected = i++ === 0 ? dep1 : dep2
		t.ok(dep)
		t.equal(dep.tripId, expected.tripId)
		t.equal(dep.stop, expected.stop)
		t.equal(dep.when, expected.when)
		t.equal(dep.delay, expected.delay)
		t.equal(dep.line, expected.line)
	})
	const observed = observe(hafas, emitter, {departures: true})
	observed.departures('321').catch(t.ifError)
})

test('arrivals', (t) => {
	const arr1 = {
		tripId: 'trip-1234',
		stop: someStop,
		when: '2018-10-25T22:02:00+0200',
		delay: 120,
		line: someLine
	}
	const arr2 = {
		tripId: 'trip-4321',
		stop: someStop,
		when: '2018-10-25T22:03:00+0200',
		delay: null,
		line: someLine
	}
	const hafas = withMocks({
		arrivals: (stationId, opt = {}) => Promise.resolve([arr1, arr2])
	})

	t.plan(2 * 6)
	let i = 0
	const emitter = listenFor('arrival', (arr) => {
		const expected = i++ === 0 ? arr1 : arr2
		t.ok(arr)
		t.equal(arr.tripId, expected.tripId)
		t.equal(arr.stop, expected.stop)
		t.equal(arr.when, expected.when)
		t.equal(arr.delay, expected.delay)
		t.equal(arr.line, expected.line)
	})
	const observed = observe(hafas, emitter, {arrivals: true})
	observed.arrivals('321').catch(t.ifError)
})

test('journeys', (t) => {
	const j1 = {
		type: 'journey',
		id: 'journey-1',
		legs: [{
			origin: '123',
			departure: '2018-11-19T08:01:00+0200',
			departureDelay: 60,
			destination: '234',
			arrival: '2018-11-19T08:32:00+0200',
			departureDelay: 120,
			line: someLine,
			direction: 'foo'
		}]
	}
	const j2 = {
		type: 'journey',
		id: 'journey-2',
		legs: [{
			origin: '123',
			departure: '2018-11-19T10:00:00+0200',
			destination: '543',
			arrival: '2018-11-19T10:15:00+0200',
			line: someLine,
			direction: 'foo'
		}, {
			origin: '543',
			departure: '2018-11-19T10:20:00+0200',
			destination: '234',
			arrival: '2018-11-19T10:30:00+0200',
			line: someLine,
			direction: 'foo'
		}]
	}
	const hafas = withMocks({
		journeys: (from, to, opt = {}) => Promise.resolve([j1, j2])
	})

	t.plan(2)
	let i = 0
	// todo: listen for `leg`
	// todo: listen for `stopover`
	const emitter = listenFor('journey', (journey) => {
		const expected = i++ === 0 ? j1 : j2
		t.deepEqual(journey, expected)
	})
	const observed = observe(hafas, emitter, {journeys: true})
	observed.journeys('123', '234').catch(t.ifError)
})

test('refreshJourney', (t) => {
	const j = {
		type: 'journey',
		id: 'journey-1',
		legs: [{
			origin: '123',
			departure: '2018-11-19T08:01:00+0200',
			departureDelay: 60,
			destination: '234',
			arrival: '2018-11-19T08:32:00+0200',
			departureDelay: 120,
			line: someLine,
			direction: 'foo'
		}]
	}
	const hafas = withMocks({
		refreshJourney: (id, opt = {}) => Promise.resolve(j)
	})

	t.plan(1)
	let i = 0
	// todo: listen for `leg`
	// todo: listen for `stopover`
	const emitter = listenFor('journey', (journey) => {
		t.deepEqual(journey, j)
	})
	const observed = observe(hafas, emitter, {journeys: true})
	observed.refreshJourney('1').catch(t.ifError)
})

test('trip', (t) => {
	const t1 = {
		type: 'trip',
		id: 'trip-1',
		line: someLine,
		direction: 'foo',
		stopovers: [{
			origin: '123',
			departure: '2018-11-19T08:01:00+0200',
			destination: '234',
			arrival: '2018-11-19T08:05:00+0200'
		}, {
			origin: '234',
			departure: '2018-11-19T08:06:00+0200',
			destination: '345',
			arrival: '2018-11-19T08:10:00+0200'
		}]
	}
	const hafas = withMocks({
		trip: (id, lineName, opt = {}) => Promise.resolve(t1)
	})

	t.plan(1)
	let i = 0
	// todo: listen for `leg`
	// todo: listen for `stopover`
	const emitter = listenFor('trip', (trip) => {
		t.deepEqual(trip, t1)
	})
	const observed = observe(hafas, emitter, {trips: true})
	observed.trip('1').catch(t.ifError)
})

test('radar', (t) => {
	const m1 = {
		location: {type: 'location', latitude: 1.23, longitude: 2.34},
		line: someLine,
		direction: 'foo',
		trip: 'trip-123',
		nextStops: [{
			stop: '123',
			arrival: '2018-11-19T08:05:00+0200',
			departure: '2018-11-19T08:01:00+0200'
		}, {
			stop: '234',
			arrival: '2018-11-19T08:06:00+0200',
			departure: '2018-11-19T08:10:00+0200'
		}]
	}
	const m2 = {
		location: {type: 'location', latitude: 1.22, longitude: 2.33},
		line: someLine,
		direction: 'bar',
		trip: 'trip-543',
		nextStops: [{
			stop: '234',
			arrival: '2018-11-19T08:05:00+0200',
			departure: '2018-11-19T08:01:00+0200'
		}, {
			stop: '123',
			arrival: '2018-11-19T08:06:00+0200',
			departure: '2018-11-19T08:10:00+0200'
		}]
	}
	const hafas = withMocks({
		radar: (bbox, opt = {}) => Promise.resolve([m1, m2])
	})

	t.plan(2)
	let i = 0
	// todo: listen for `stopover`
	const emitter = listenFor('movement', (movement) => {
		const expected = i++ === 0 ? m1 : m2
		t.deepEqual(movement, expected)
	})
	const observed = observe(hafas, emitter, {movements: true})
	observed.radar({
		north: 1.34, south: 1.12,
		west: 2.23, east: 2.45
	}).catch(t.ifError)
})
