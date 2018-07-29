import { createHash } from 'crypto'
import Cache from 'simple-lru-cache'
import objectHash from 'object-hash'

/**
 * Generate the hash of the value.
 *
 * @api private
 */
function hashValueHash(a, b, c, d) {
	return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0
}

class BeeQueueDynamic {
	constructor(options = {}) {
		this._queues = []
		this._algorithm = options._algorithm || 'md5'
		for (const { queue, address, weight } of options.queues) {
			this._queues.push({ queue, address, weight })
		}
		this._replicas = options.replicas || 1
		this._cache = new Cache({
			maxSize: options.maxCacheSize || 5000,
		})

		this._continuum()
	}

	createJob(payload) {
		const hash = this._hashPayload(payload)
		const queue = this._get(hash)

		return queue.createJob(payload)
	}

	_continuum() {
		this._ring = []

		const totalWeight = this._queues.reduce((a, v) => v.weight + a, 0)

		let index = 0
		for (const { queue, address, weight } of this._queues) {
			const percentage = weight / totalWeight
			const length = Math.floor(percentage * this._queues.length)

			for (let i = 0; i < length; i++) {
				const x = this._hash((address || queue.name) + i)

				for (let j = 0; j < this._replicas; j++) {
					const key = hashValueHash(
						x[3 + j * 4],
						x[2 + j * 4],
						x[1 + j * 4],
						x[0 + j * 4],
					)
					this._ring[index] = { key, queue }
					index++
				}
			}
		}

		this._ring.sort((a, b) => {
			if (a.key === b.key) return 0
			if (a.key > b.key) return 1
			return -1
		})

		this._size = this._ring.length
	}

	_get(payloadHash) {
		const key = payloadHash.toString('hex')

		const cache = this._cache.get(key)
		if (cache) return cache

		const node = this._ring[this._find(this._hashValueHash(payloadHash))]
		if (!node) return void 0

		this._cache.set(key, node.queue)
		return node.queue
	}

	_find(hashValue) {
		let ring = this._ring
		let high = this._size
		let low = 0
		let middle, prev, mid

		// eslint-disable-next-line
		while (true) {
			mid = (low + high) >> 1

			if (mid === this._size) return 0

			middle = ring[mid].key
			prev = mid === 0 ? 0 : ring[mid - 1].key

			if (hashValue <= middle && hashValue > prev) return mid

			if (middle < hashValue) {
				low = mid + 1
			} else {
				high = mid - 1
			}

			if (low > high) return 0
		}
	}

	_hash(string) {
		return createHash(this._algorithm)
			.update(string)
			.digest()
	}

	_hashPayload(payload) {
		return objectHash(payload, {
			algorithm: this._algorithm,
			encoding: 'buffer',
		})
	}

	_hashValueHash(buff) {
		return hashValueHash(buff[3], buff[2], buff[1], buff[0])
	}
}

export default BeeQueueDynamic
