import { defaultAlgorithm } from './constants'
import { payloadToToken, tokenToQueue } from './token-utils'

class BeeQueueDynamic {
	constructor(options = {}) {
		this._queues = []
		this._algorithm = options.algorithm || defaultAlgorithm
	}

	registerQueue(queue) {
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

		const token = payloadToToken(payload, this._algorithm)
		const queueIndex = tokenToQueue(token, this._queues.length)
		const queue = this._queues[queueIndex]

		return queue.createJob(payload)
	}
}

export default BeeQueueDynamic
