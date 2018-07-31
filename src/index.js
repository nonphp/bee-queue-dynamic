import { payloadToToken, tokenToQueue } from './token-utils'

class BeeQueueDynamic {
	constructor(options = {}) {
		this._queues = []
		this._algorithm = options._algorithm || 'sha256'
	}

	registerQueue(queue) {
		this._queues.push(queue)
	}

	createJob(payload) {
		const token = payloadToToken(payload, this._algorithm)
		const queueIndex = tokenToQueue(token, this._queues.length)
		const queue = this._queues[queueIndex]

		return queue.createJob(payload)
	}
}

export default BeeQueueDynamic
