# observe-hafas-client

**Observe all departures/arrivals/etc. returned by a [`hafas-client`](https://github.com/public-transport/hafas-client) instance.**

[![npm version](https://img.shields.io/npm/v/observe-hafas-client.svg)](https://www.npmjs.com/package/observe-hafas-client)
[![build status](https://api.travis-ci.org/public-transport/observe-hafas-client.svg?branch=master)](https://travis-ci.org/public-transport/observe-hafas-client)
![ISC-licensed](https://img.shields.io/github/license/public-transport/observe-hafas-client.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installation

```shell
npm install observe-hafas-client
```


## Usage

```js
const createHafas = require('db-hafas')
const {EventEmitter} = require('events')
const observe = require('observe-hafas-client')

const hafas = createHafas('my-awesome-program')

// set up observing
const observer = new EventEmitter()
observer.on('departure', console.log)
const observedHafas = observe(hafasClient, observer, {departures: true})

// query data from HAFAS
observedHafas.departures('8011160') // Berlin Hbf
.then(console.log)
.catch(console.error)
```


## API

```js
observeHafasClient(hafas, emitter, watch)
```

`hafas` must be a `hafas-client` instance. `emitter` must be an [event emitter](https://nodejs.org/api/events.html#events_class_eventemitter). `watch` must be an object with one or more flags of the following list set to `true`:

- `departures`: `departure` events emitted on `.departures()`
- `arrivals`: `arrival` events emitted on `.arrivals()`
- `journeys`: `journey` events emitted on `.journeys()`
- `legs`: `leg` events emitted on `.journeys()`, `.refreshJourney()`
- `stopovers`: `stopover` events emitted on `.journeys()`, `.refreshJourney()`, `.trip()`
- `trips`: `trip` events emitted on `.journeys()`, `.refreshJourney()`, `.trip()`
- `movements`: `movement` events emitted on `.radar()`


## Contributing

If you have a question or need support using `observe-hafas-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/public-transport/observe-hafas-client/issues).
