const fetch = require('node-fetch')

const { THINGS_SERVICE_HOST, THINGS_SERVICE_PORT } = require('../env')
const logger = require('../logger')
const { ThingsServiceError } = require('../errors')

const apiPrefix = `http://${THINGS_SERVICE_HOST}:${THINGS_SERVICE_PORT}/v1`

const getThings = async ({ ingest, ingestId }) => {
  const urlParams = new URLSearchParams({
    ...(ingest !== undefined ? { ingest } : {}),
    ...(ingestId !== undefined ? { ingestId: ingestId } : {}),
  })

  const url = `${apiPrefix}/thing?` + urlParams
  const response = await fetch(url)

  if (!response.ok) {
    logger.warn(
      `Error fetching things from things service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new ThingsServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

module.exports = {
  getThings,
}
