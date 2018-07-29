import bigInt from 'big-integer'
import objectHash from 'object-hash'

export function payloadToToken(payload) {
	return hashToToken(payloadToHash(payload))
}

export function payloadToHash(payload) {
	return objectHash(payload, {
		algorithm: 'md5',
		encoding: 'hex',
	})
}

export function hashToToken(hash) {
	const num = bigInt(hash, 16)
	const token = num.mod(256).toJSNumber()

	return token
}

export function tokenToQueue(token, numQueues) {
	return Math.floor((token / 256) * numQueues)
}
