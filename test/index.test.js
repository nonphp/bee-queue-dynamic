import assert from 'assert'
import Queue from 'bee-queue'

import Dynamic from '../src'

describe('Dynamic Bee-Queue', () => {
	it('should throw an error if invalid strategy specified', () => {
		assert.throws(() => {
			new Dynamic({ strategy: 'invalid' })
		}, /invalid strategy: invalid/)
	})

	it('should be able to add queue using "registerQueue" method', () => {
		const dynamic = new Dynamic()
		const queues = dynamic._queues
		const queue = new Queue('test')

		dynamic.registerQueue(queue)

		assert.strictEqual(queues.length, 1)
		assert.strictEqual(queues[0], queue)
	})

	it('should throw an error if invalid object is passed in "registerQueue" method', () => {
		const dynamic = new Dynamic()

		assert.throws(() => {
			dynamic.registerQueue({})
		}, /invalid queue/)
	})

	it('should be able to unregister queue using "unregisterQueue" method', () => {
		const dynamic = new Dynamic()
		const queues = dynamic._queues
		const queue1 = new Queue('test')
		const queue2 = new Queue('test')
		const queue3 = new Queue('test')

		dynamic.registerQueue(queue1)
		dynamic.registerQueue(queue2)
		dynamic.registerQueue(queue3)

		assert.strictEqual(queues.length, 3)

		dynamic.unregisterQueue(queue2)

		assert.strictEqual(queues.length, 2)
		assert.strictEqual(queues[0], queue1)
		assert.strictEqual(queues[1], queue3)
	})

	it('should not do anything if unknown queue is passed in "unregisterQueue" method', () => {
		const dynamic = new Dynamic()
		const queues = dynamic._queues
		const queue1 = new Queue('test')
		const queue2 = new Queue('test')

		dynamic.registerQueue(queue1)

		assert.strictEqual(queues.length, 1)
		assert.strictEqual(queues[0], queue1)

		dynamic.unregisterQueue(queue2)

		assert.strictEqual(queues.length, 1)
		assert.strictEqual(queues[0], queue1)
	})

	it('should throw an error if no queues are present during "createJob" call', () => {
		const dynamic = new Dynamic()

		assert.throws(() => {
			dynamic.createJob({})
		}, /Dynamic queue wrapper has no queues/)
	})
})
