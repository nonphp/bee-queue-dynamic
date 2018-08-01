import assert from 'assert'
import { randomBytes } from 'crypto'

import {
	payloadToToken,
	payloadToHash,
	hashToToken,
	tokenToQueue
} from 'common/token-utils'

import { defaultAlgorithm, hashSize, tokenSize } from 'common/constants'

describe('Token Utils', () => {
	describe('payloadToHash', () => {
		it('should produce valid hash for payload', () => {
			const numTries = 1000

			for (let i = 0; i < numTries; i++) {
				const payload = makeRandomObject({ maxProps: 1, maxDepth: 1 })
				const hash = payloadToHash(payload, defaultAlgorithm)

				assert.ok(typeof hash === 'string')
				assert.ok(hash.length === hashSize * 2)
			}
		}).timeout(60000)
	})

	describe('payloadToToken', () => {
		it('should return a token for a valid payload', () => {
			const numTries = 1000

			for (let i = 0; i < numTries; i++) {
				const payload = makeRandomObject({ maxProps: 1, maxDepth: 1 })
				const token = payloadToToken(payload, defaultAlgorithm)

				assert.ok(typeof token === 'number')
			}
		}).timeout(60000)
	})

	describe('tokenToQueue', () => {
		it('should map token to queue for any token', () => {
			for (let numQueues = 1; numQueues < tokenSize; numQueues++) {
				const hasToken = Array.from(Array(numQueues)).fill(false)
				const numTokensPerQueue = Array.from(Array(numQueues)).fill(0)
				for (let token = 0; token < tokenSize; token++) {
					const queueIndex = tokenToQueue(token, numQueues)

					assert.ok(queueIndex <= numQueues - 1, 'queue index is out of bounds')
					assert.ok(queueIndex >= 0, 'queue index is out of bounds')

					numTokensPerQueue[queueIndex]++
					hasToken[queueIndex] = true
				}

				assert.ok(
					hasToken.every(v => v === true),
					'tokenToQueue doesnt produce index for every queue in range',
				)
				assert.ok(
					numTokensPerQueue.every(v => Math.abs(v - numTokensPerQueue[0]) < 2),
					'tokenToQueue is not equally distributed across queues',
				)
			}
		}).timeout(60000)
	})

	describe('hashToToken', () => {
		it('should return a number from 0 to tokenSize for any hash', () => {
			const numTries = tokenSize * 25
			const hitsPerToken = {}
			const onlyKeys = Array.from(Array(tokenSize)).map((v, i) => i)

			for (let i = 0; i < numTries; i++) {
				const hash = randomBytes(hashSize).toString('hex')
				const token = hashToToken(hash)

				hitsPerToken[token] = true

				assert.ok(token >= 0)
				assert.ok(token < tokenSize)
			}

			assert.deepStrictEqual(
				onlyKeys,
				Object.keys(hitsPerToken)
					.map(v => +v)
					.sort((a, b) => a - b),
			)
		}).timeout(60000)

		it('should distribute tokens evenly', () => {
			const numTries = 100 * 1000
			const hitsPerToken = Array.from(Array(tokenSize)).fill(0)
			const numQueues = 107
			const tokensPerQueue = Array.from(Array(numQueues)).fill(0)

			for (let i = 0; i < numTries; i++) {
				const hash = randomBytes(hashSize).toString('hex')
				const token = hashToToken(hash)
				hitsPerToken[token]++

				const queueIndex = tokenToQueue(token, numQueues)
				tokensPerQueue[queueIndex]++
			}

			const moveRange = []
			for (let i = 0; i < hitsPerToken.length - 1; i++) {
				moveRange[i] = Math.abs(hitsPerToken[i] - hitsPerToken[i + 1])
			}

			const avgMoveRange = avg(moveRange)
			const avgHitsPerToken = avg(hitsPerToken)
			const upperBoundary = avgHitsPerToken + avgMoveRange * 2.66
			const lowerBoundary = avgHitsPerToken - avgMoveRange * 2.66

			const upperBoundaryThreshold = numTries / tokenSize / 2
			const lowerBoundaryThreshold = numTries / tokenSize / 2

			console.log('avgMoveRange', avgMoveRange)
			console.log('avgHitsPerToken', avgHitsPerToken)
			console.log('upperBoundary', upperBoundary)
			console.log('upperBoundaryThreshold', upperBoundaryThreshold)
			console.log('lowerBoundaryThreshold', lowerBoundaryThreshold)

			for (let i = 0; i < hitsPerToken.length; i++) {
				if (hitsPerToken[i] > upperBoundary) {
					assert.ok(
						Math.abs(upperBoundary - hitsPerToken[i]) <= upperBoundaryThreshold,
						`number of hits strongly exceeds the upper boundary: token ${i}, hits ${
							hitsPerToken[i]
						}`,
					)
				}

				if (hitsPerToken[i] < lowerBoundary) {
					assert.ok(
						Math.abs(hitsPerToken[i] - lowerBoundary) <= lowerBoundaryThreshold,
						`number of hits strongly exceeds the lower boundary: token ${i}, hits ${
							hitsPerToken[i]
						}`,
					)
				}
			}
		}).timeout(60000)
	})
})

function makeRandomObject({ maxProps = 5, maxDepth = 3, depth }) {
	const res = {}

	const numProps = Math.floor(Math.random() * maxProps) + 1

	if (typeof depth === 'undefined') {
		depth = Math.floor(Math.random() * maxDepth) + 1
	}

	for (let i = 0; i < numProps; i++) {
		const prop = Math.random().toString(36)

		if (depth > 0) {
			res[prop] = makeRandomObject({ maxProps, depth: depth - 1 })
		} else {
			res[prop] = Math.random().toString(36)
		}
	}

	return res
}

function avg(arr) {
	return arr.reduce((a, v) => a + v, 0) / arr.length
}
