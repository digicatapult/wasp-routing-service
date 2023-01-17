import { Kafka, logLevel as kafkaLogLevels } from 'kafkajs'
import delay from 'delay'
import request from 'supertest'

import env from '../../../app/env.js'
import { createHttpServer } from '../../../app/server.js'

const { KAFKA_BROKERS, KAFKA_PAYLOAD_ROUTING_PREFIX } = env

let apiObj = null
const setupServer = (context) => {
  before(async function () {
    this.timeout(30000)
    this.slow(10000)
    if (apiObj === null) {
      const server = await createHttpServer()
      apiObj = { server, request: request(server.app) }
    }
    Object.assign(context, apiObj)
  })
}

let producer = null,
  consumer = null
const setupKafka = () => {
  before(async function () {
    this.timeout(30000)

    const kafka = new Kafka({
      clientId: 'test-routing-service',
      brokers: KAFKA_BROKERS,
      logLevel: kafkaLogLevels.NOTHING,
    })

    producer = kafka.producer()
    await producer.connect()

    const rawConsumer = kafka.consumer({ groupId: 'test-routing-service' })
    await rawConsumer.connect()
    await rawConsumer.subscribe({ topic: `${KAFKA_PAYLOAD_ROUTING_PREFIX}.testThing`, fromBeginning: false })

    const messages = []
    await rawConsumer.run({
      eachMessage: async ({ message: { key, value } }) => {
        messages.push({ key: key.toString('utf8'), value: JSON.parse(value.toString('utf8')) })
      },
    })

    consumer = {
      clearMessages: () => {
        messages.splice(0, messages.length)
      },
      waitForNMessages: async (n) => {
        for (let i = 0; i < 5 && messages.length < n; i++) {
          await delay(100)
        }
        await delay(100)
        return messages
      },
      disconnect: async () => {
        await rawConsumer.disconnect()
      },
    }
  })

  after(async function () {
    this.timeout(30000)

    await Promise.all([producer.disconnect(), consumer.disconnect()])
    producer = null
    consumer = null
  })
}

const getProducer = () => {
  if (producer === null) {
    throw new Error('Tried to get test producer whilst not instantiated')
  } else {
    return producer
  }
}

const getConsumer = () => {
  if (consumer === null) {
    throw new Error('Tried to get test consumer whilst not instantiated')
  } else {
    return consumer
  }
}

export { setupServer, setupKafka, getProducer, getConsumer }
