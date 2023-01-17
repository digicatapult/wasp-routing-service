/* eslint-disable no-console */
import { describe, before, it } from 'mocha'
import { expect } from 'chai'

import { setupServer, setupKafka } from './helper/setupHelper.js'
import { setup as setupThings } from './helper/thingsMock.js'
import { sendRawPayloadAndWaitForRoutedPayload } from './helper/routingHelper.js'

const topic = 'raw-payloads'

describe('Routing raw packets to thing queues', function () {
  const context = {}

  setupThings()
  setupKafka()
  setupServer(context)

  describe('Routing for valid ingestId', function () {
    let thingId
    let ingestId
    let ingest
    let timestamp
    let metadata
    let messages

    before(async function () {
      thingId = '01000000-0000-4000-8883-c7df300514ed'
      ingestId = '4883C7DF300514ED'
      ingest = 'ttn-v2'
      timestamp = '2021-08-31T14:51:36.507Z'
      metadata = {}

      messages = await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        )
      )
    })

    it('should forward message correctly', function () {
      expect(messages).to.deep.equal([
        {
          key: thingId,
          value: {
            thingId,
            type: 'testThing',
            ingest,
            ingestId,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          },
        },
      ])
    })
  })

  describe('Routing for invalid ingestId', function () {
    let ingestId
    let ingest
    let timestamp
    let metadata
    let messages

    before(async function () {
      ingestId = 'INVALID'
      ingest = 'ttn-v2'
      timestamp = '2021-08-31T14:51:36.507Z'
      metadata = {}

      messages = await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        0
      )
    })

    it('should not forward messages', function () {
      expect(messages).to.deep.equal([])
    })
  })

  describe('Routing for invalid ingestId followed by valid', function () {
    let thingId
    let ingestId_1
    let ingestId_2
    let ingest
    let timestamp
    let metadata
    let messages

    before(async function () {
      thingId = '01000000-0000-4000-8883-c7df300514ed'
      ingestId_1 = 'INVALID'
      ingestId_2 = '4883C7DF300514ED'
      ingest = 'ttn-v2'
      timestamp = '2021-08-31T14:51:36.507Z'
      metadata = {}

      await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId_1,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId: ingestId_1,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        0
      )

      messages = await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId_2,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId: ingestId_2,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        1
      )
    })

    it('should forward message correctly', function () {
      expect(messages).to.deep.equal([
        {
          key: thingId,
          value: {
            thingId,
            type: 'testThing',
            ingest,
            ingestId: ingestId_2,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          },
        },
      ])
    })
  })

  describe('Routing with error from things service', function () {
    let ingestId
    let ingest
    let timestamp
    let metadata
    let messages

    before(async function () {
      ingestId = 'ERROR'
      ingest = 'ttn-v2'
      timestamp = '2021-08-31T14:51:36.507Z'
      metadata = {}

      messages = await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        0
      )
    })

    it('should not forward messages', function () {
      expect(messages).to.deep.equal([])
    })
  })

  describe('Routing with error from things service followed by ok', function () {
    let thingId
    let ingestId_1
    let ingestId_2
    let ingest
    let timestamp
    let metadata
    let messages

    before(async function () {
      thingId = '01000000-0000-4000-8883-c7df300514ed'
      ingestId_1 = 'ERROR'
      ingestId_2 = '4883C7DF300514ED'
      ingest = 'ttn-v2'
      timestamp = '2021-08-31T14:51:36.507Z'
      metadata = {}

      await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId_1,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId: ingestId_1,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        0
      )

      messages = await sendRawPayloadAndWaitForRoutedPayload(
        topic,
        ingestId_2,
        Buffer.from(
          JSON.stringify({
            ingest,
            ingestId: ingestId_2,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          })
        ),
        1
      )
    })

    it('should forward message correctly', function () {
      expect(messages).to.deep.equal([
        {
          key: thingId,
          value: {
            thingId,
            type: 'testThing',
            ingest,
            ingestId: ingestId_2,
            timestamp,
            payload: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            metadata,
          },
        },
      ])
    })
  })
})
