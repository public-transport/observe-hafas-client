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
	const emitter = expectEvents('departure', (dep) => {
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
