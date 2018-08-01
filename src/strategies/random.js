export default function randomDistributionStrategy(dynamic) {
	const queues = dynamic._queues

	return function distribute() {
		return Math.floor(Math.random() * queues.length)
	}
}
