import { defaultAlgorithm } from 'common/constants'

import tokenBasedStrategy from 'strategies/token'
import randomStrategy from 'strategies/random'

const Strategies = {
	random: randomStrategy,
	token: tokenBasedStrategy,
}

class BeeQueueDynamic {
	constructor(options = {}) {
		this._algorithm = options.algorithm || defaultAlgorithm
		this._strategy = options.strategy || 'token'

		if (!(this._strategy in Strategies)) {
			throw new Error('invalid strategy: ' + options.strategy)
		}

		this._queues = []
		this._distribute = Strategies[this._strategy](this)
	}

	registerQueue(queue) {
		if (!queue || !queue.settings || !queue.name || !queue.createJob) {
			throw new Error('invalid queue')
		}

		this._queues.push(queue)
	}

	unregisterQueue(queue) {
		const index = this._queues.indexOf(queue)

		if (~index) {
			this._queues.splice(index, 1)
		}
	}

	createJob(payload) {
		if (!this._queues.length) {
			throw new Error('Dynamic queue wrapper has no queues')
		}

		const queueIndex = this._distribute(payload)
		const queue = this._queues[queueIndex]

		return queue.createJob(payload)
	}
}

export default BeeQueueDynamic
