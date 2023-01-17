import { before, after } from 'mocha'

import express from 'express'

import env from '../../../app/env.js'

const { THINGS_SERVICE_PORT } = env

const thingsMock = [
  {
    id: '01000000-0000-4000-8883-c7df300514ed',
    type: 'testThing',
    metadata: {},
    ingests: [
      {
        ingest: 'ttn-v2',
        ingestId: '4883C7DF300514ED',
        configuration: {
          devEui: '4883C7DF300514ED',
          otaaAppKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaff',
        },
      },
    ],
  },
]

const setupThingsMock = () => {
  before(async function () {
    const app = express()

    app.get('/v1/thing', async (req, res) => {
      if (req.query.ingestId === 'ERROR') {
        res.status(500).send('Error')
      }

      const things = thingsMock.filter(
        ({ ingests: [{ ingest, ingestId }] }) => ingest === req.query.ingest && ingestId === req.query.ingestId
      )
      res.status(200).send(things)
    })

    await new Promise((resolve, reject) => {
      const server = app.listen(THINGS_SERVICE_PORT, (err) => {
        context.thingsServer = server
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })

  after(function () {
    return new Promise((resolve, reject) => {
      context.thingsServer.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export { setupThingsMock as setup }
