'use strict'

const observeHafasClient = (hafas, emitter, watch) => {
	const onJourney = (journey) => {
		emitter.emit('journey', journey)
		for (const leg of journey.legs) {
			emitter.emit('leg', leg)
			if (!Array.isArray(leg.stopovers)) continue
			for (const stopover of leg.stopovers) {
				emitter.emit('stopover', {
					...stopover,
					tripId: leg.id,
					line: leg.line
				})
			}
		}
	}
	const wrapper = Object.create(hafas)

	if (watch.departures) {
		const observedDepartures = (station, opt = {}) => {
			return hafas.departures(station, opt)
			.then((departures) => {
				for (const dep of departures) emitter.emit('departure', dep)
				return departures
			})
		}
		wrapper.departures = observedDepartures
	}
	if (watch.arrivals) {
		const observedArrivals = (station, opt = {}) => {
			return hafas.arrivals(station, opt)
			.then((arrivals) => {
				for (const arr of arrivals) emitter.emit('arrival', arr)
				return arrivals
			})
		}
		wrapper.arrivals = observedArrivals
	}

	const spyOnJourneys = watch.journeys || watch.legs || watch.stopovers
	if (spyOnJourneys && hafas.journeys) {
		const observedJourneys = (from, to, opt = {}) => {
			return hafas.journeys(from, to, opt)
			.then((journeys) => {
				for (const journey of journeys) onJourney(journey)
				return journeys
			})
		}
		wrapper.journeys = observedJourneys
	}

	const spyOnRefreshJourney = watch.journeys || watch.legs || watch.stopovers
	if (spyOnRefreshJourney && hafas.refreshJourney) {
		const observedRefreshJourney = (refreshToken, opt = {}) => {
			return hafas.refreshJourney(refreshToken, opt)
			.then((journey) => {
				onJourney(journey)
				return journey
			})
		}
		wrapper.refreshJourney = observedRefreshJourney
	}

	const spyOnTrip = watch.trips || watch.stopovers
	if (spyOnTrip && hafas.trip) {
		const observedTrip = (id, lineName, opt = {}) => {
			return hafas.trip(id, lineName, opt)
			.then((trip) => {
				emitter.emit('trip', trip)
				if (Array.isArray(trip.stopovers)) {
					for (const stopover of trip.stopovers) {
						emitter.emit('stopover', {
							...stopover,
							tripId: trip.id,
							line: trip.line
						})
					}
				}
				return trip
			})
		}
		wrapper.trip = observedTrip
	}

	const spyOnRadar = watch.movements || watch.stopovers
	if (spyOnRadar && hafas.radar) {
		const observedRadar = (bbox, opt = {}) => {
			return hafas.radar(bbox, opt)
			.then((movements) => {
				for (const movement of movements) {
					emitter.emit('movement', movement)
					for (const stopover of movement.nextStops) {
						emitter.emit('stopover', {
							...stopover,
							line: movement.line,
							tripId: movement.trip
						})
					}
				}
				return movements
			})
		}
		wrapper.radar = observedRadar
	}

	return wrapper
}

module.exports = observeHafasClient
