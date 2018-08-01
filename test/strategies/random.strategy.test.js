import assert from 'assert'
import Queue from 'bee-queue'

import Dynamic from '../../src'
import randomStrategy from 'strategies/random'

describe('Random Strategy', () => {
	it('should export function that returns function that returns number', () => {
		assert.ok(randomStrategy instanceof Function)
		const instance = randomStrategy({ _queues: [] })

		assert.ok(typeof instance({}) === 'number')
	})

	it('shoud be able to use "random" as a strategy', () => {
		const queue = new Queue('test')
		const dynamic = new Dynamic({ strategy: 'random' })

		dynamic.registerQueue(queue)

		const job = dynamic.createJob({})

		assert.strictEqual(job.queue.name, 'test')
	})
})
