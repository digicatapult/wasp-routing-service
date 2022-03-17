const { Kafka, logLevel: kafkaLogLevels } = require('kafkajs')
const { InvalidIngestIdError } = require('./errors')

const logger = require('./logger')
const { KAFKA_BROKERS, KAFKA_PAYLOAD_TOPIC, KAFKA_LOG_LEVEL, KAFKA_PAYLOAD_ROUTING_PREFIX } = require('./env')
const {
  things: { getThings },
} = require('./services')

const setupRawPayloadConsumer = async () => {
  const kafkaLogger = logger.child({ module: 'kafkajs-payloads' }, { level: 'error' })
  const logCreator =
    () =>
    ({ label, log }) => {
      const { message } = log
      kafkaLogger[label.toLowerCase()]({
        message,
      })
    }

  const kafka = new Kafka({
    clientId: 'routing-service-payloads', // TODO: this should be particular to this routing-service
    brokers: KAFKA_BROKERS,
    logLevel: kafkaLogLevels[KAFKA_LOG_LEVEL.toUpperCase()],
    logCreator,
  })

  const producer = kafka.producer()
  await producer.connect()

  const consumer = kafka.consumer({ groupId: 'routing-service-payloads' })
  await consumer.connect()
  await consumer.subscribe({ topic: KAFKA_PAYLOAD_TOPIC, fromBeginning: false })

  //  TODO: work out correct behaviour here
  await consumer
    .run({
      eachMessage: async ({ message: { key, value } }) => {
        try {
          const ingestId = key.toString('utf8')
          logger.debug('Raw payload received for %s', ingestId)

          const parsedValue = JSON.parse(value.toString('utf8'))
          logger.trace(`Payload is %j`, parsedValue)

          const { ingest } = parsedValue

          const thingSearch = await getThings({ ingest, ingestId })
          if (thingSearch.length !== 1) {
            throw new InvalidIngestIdError({ ingest, ingestId })
          }
          const { id: thingId, type } = thingSearch[0]
          const topic = `${KAFKA_PAYLOAD_ROUTING_PREFIX}.${type}`

          logger.debug('Forwarding payload for %s to %s %j', thingId, topic, {
            key: thingId,
            value: JSON.stringify({
              ...parsedValue,
              thingId,
              type,
            }),
          })

          await producer.send({
            topic,
            messages: [
              {
                key: thingId,
                value: JSON.stringify({
                  ...parsedValue,
                  thingId,
                  type,
                }),
              },
            ],
          })
        } catch (err) {
          logger.warn(`Unexpected error processing payload. Error was ${err.message || err}`)
        }
      },
    })
    .then(() => {
      logger.info(`Kafka consumer has started`)
    })
    .catch((err) => {
      logger.fatal(`Kafka consumer could not start consuming. Error was ${err.message || err}`)
    })

  return {
    disconnect: async () => {
      try {
        await consumer.stop()
        await consumer.disconnect()
      } catch (err) {
        logger.warn(`Error disconnecting from kafka: ${err.message || err}`)
      }
    },
  }
}

module.exports = setupRawPayloadConsumer
