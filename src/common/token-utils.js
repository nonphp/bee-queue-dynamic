import bigInt from 'big-integer'
import objectHash from 'object-hash'

import { tokenSize } from './constants'

export function payloadToToken(payload, algorithm) {
	return hashToToken(payloadToHash(payload, algorithm))
}

export function payloadToHash(payload, algorithm) {
	return objectHash(payload, {
		algorithm,
		encoding: 'hex',
	})
}

export function hashToToken(hash) {
	const num = bigInt(hash, 16)
	const token = num.mod(tokenSize).toJSNumber()

	return token
}

export function tokenToQueue(token, numQueues) {
	return Math.floor((token / tokenSize) * numQueues)
}
