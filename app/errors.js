class UnknownThingError extends Error {
  constructor(message) {
    super(message)
  }
}

class InvalidIngestIdError extends UnknownThingError {
  constructor({ ingest, ingestId }) {
    super(`Unknown thing ${ingestId} for ingest ${ingest}`)
    this.name = 'InvalidThingIdError'
    this.ingest = ingest
    this.ingestId = ingestId
  }
}

class ThingsServiceError extends Error {
  constructor({ code, message }) {
    super(message)
    this.code = code
  }
}

export { UnknownThingError, InvalidIngestIdError, ThingsServiceError }
