import { payloadToToken, tokenToQueue } from 'common/token-utils'

export default function tokenBasedDistributionStrategy(dynamic) {
	const queues = dynamic._queues
	const hashAlgorithm = dynamic._algorithm

	return function distribute(payload) {
		const token = payloadToToken(payload, hashAlgorithm)

		return tokenToQueue(token, queues.length)
	}
}
