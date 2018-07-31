# bee-queue-dynamic

# Description

This project helps distribute jobs evenly across multiple queues.
It uses [object-hash] to compute hash of the job's payload and then transforms it into a number.
Then this number is transformed into a token by applying module operation (`token = hashVal % maxToken`).
Tokens then used to decide on which queue to post the job (`queueIndex = token % amountOfQueues`).
See [Example](#example) below for usage instructions.

# Example

```js
import Queue from 'bee-queue'
import Dynamic from 'bee-queue-dynamic'

const redisServers = [
  {
    host: '0.0.0.1',
    port: 6379,
    db: 0,
    options: {},
  },
  {
    host: '0.0.0.2',
    port: 6379,
    db: 0,
    options: {},
  },
  // ...
]

const dynamic = new Dynamic()

for (const redis of redisServers) {
  const queue = new Queue('test', { redis })

  dynamic.registerQueue(queue)
}

void (async function main() {
  // job will be created on one of the queues
  const job = await dynamic.createJob({ test: 'data' }).save()

  console.log(job.queue.settings.host) // outputs one of: '0.0.0.1', '0.0.0.1'
})()
```

# FAQ

Q: How much exactly even the distribution is?
A: It depends on how different your job payloads are. This project has not been tested in any production environment yet. I will update this question once I do some actual tests.
Here is test results for distributing 100 000 fully random jobs across 17 queues:

```
jobsPerQueue { 'queue-0': 5944,
  'queue-1': 5892,
  'queue-2': 5826,
  'queue-3': 5878,
  'queue-4': 5785,
  'queue-5': 5895,
  'queue-6': 5870,
  'queue-7': 5861,
  'queue-8': 5881,
  'queue-9': 5914,
  'queue-10': 5788,
  'queue-11': 5997,
  'queue-12': 5867,
  'queue-13': 5858,
  'queue-14': 6003,
  'queue-15': 5827,
  'queue-16': 5914 }
```
