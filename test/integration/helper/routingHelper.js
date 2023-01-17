import { getConsumer, getProducer } from './setupHelper.js'

export const sendRawPayloadAndWaitForRoutedPayload = async (topic, ingestId, value, waitCount = 1) => {
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
}
