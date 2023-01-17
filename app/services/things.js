import fetch from 'node-fetch'

import env from '../env.js'
import logger from '../logger.js'
import { ThingsServiceError } from '../errors.js'

const { THINGS_SERVICE_HOST, THINGS_SERVICE_PORT } = env
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

export default { getThings }
