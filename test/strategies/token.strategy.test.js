import assert from 'assert'
import Queue from 'bee-queue'

import Dynamic from '../../src'
import tokenStrategy from 'strategies/token'

describe('Token Strategy', () => {
	it('should export function that returns function that returns number', () => {
		assert.ok(tokenStrategy instanceof Function)
		const instance = tokenStrategy({ _queues: [] })

		assert.ok(typeof instance({}) === 'number')
	})

	it('shoud be able to use "token" as a strategy', () => {
		const queue = new Queue('test')
		const dynamic = new Dynamic({ strategy: 'token' })

		dynamic.registerQueue(queue)

		const job = dynamic.createJob({})

		assert.strictEqual(job.queue.name, 'test')
	})
})
