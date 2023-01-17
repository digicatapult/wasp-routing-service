import pino from 'pino'
import env from './env.js'

const logger = pino(
  {
    name: 'ROUTING_SERVICE',
    level: env.LOG_LEVEL,
  },
  process.stdout
)

logger.debug('Environment variables: %j', env)

export default logger
