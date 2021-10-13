const { getConsumer, getProducer } = require('./setupHelper')

const that = {
  sendRawPayloadAndWaitForRoutedPayload: async (topic, ingestId, value, waitCount = 1) => {
    const producer = getProducer()
    const consumer = getConsumer()

    consumer.clearMessages()

    await producer.send({
      topic,
      messages: [
        {
          key: ingestId,
          value,
        },
      ],
    })
    return consumer.waitForNMessages(waitCount)
  },
}

module.exports = that
