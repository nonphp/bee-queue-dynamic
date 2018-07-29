import Queue from 'bee-queue'
import assert from 'assert'
import { randomBytes } from 'crypto'

import Dynamic from '../src'

describe.only('Dynamic Bee-Queue', () => {
	it('should distribute jobs evenly across queues', () => {
		const queues = Array.from(Array(3)).map((v, i) => new Queue('queue-' + i))

		const dynamicQueue = new Dynamic({
			queues: queues.map(queue => ({ queue, weight: 100 })),
		})

		const maxJobs = 100 * 1000

		const jobsPerQueue = {}

		for (const queue of queues) {
			jobsPerQueue[queue.name] = 0
		}

		for (let i = 0; i < maxJobs; i++) {
			const payload = makeRandomObject({ maxProps: 2 })
			const job = dynamicQueue.createJob(payload)

			const originalQueue = job.queue.name
			jobsPerQueue[originalQueue]++
		}

		console.log(jobsPerQueue)
	}).timeout(60000)
})

function makeRandomObject({ maxProps = 5, maxDepth = 3, depth }) {
	const res = {}

	const numProps = Math.floor(Math.random() * maxProps) + 1

	if (typeof depth === 'undefined') {
		depth = Math.floor(Math.random() * maxDepth) + 1
	}

	for (let i = 0; i < numProps; i++) {
		const prop = randomBytes(8).toString('hex')

		if (depth > 0) {
			res[prop] = makeRandomObject({ maxProps, depth: depth - 1 })
		} else {
			res[prop] = randomBytes(8).toString('hex')
		}
	}

	return res
}