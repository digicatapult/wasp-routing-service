import envalid from 'envalid'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'test/test.env' })
} else {
  dotenv.config()
}

const vars = envalid.cleanEnv(
  process.env,
  {
    LOG_LEVEL: envalid.str({ default: 'info', devDefault: 'debug' }),
    KAFKA_LOG_LEVEL: envalid.str({
      default: 'nothing',
      choices: ['debug', 'info', 'warn', 'error', 'nothing'],
    }),
    PORT: envalid.port({ default: 3002 }),
    KAFKA_BROKERS: envalid.makeValidator((input) => {
      const kafkaSet = new Set(input === '' ? [] : input.split(','))
      if (kafkaSet.size === 0) throw new Error('At least one kafka broker must be configured')
      return [...kafkaSet]
    })({ default: ['localhost:9092'] }),
    KAFKA_PAYLOAD_TOPIC: envalid.makeValidator((str) => {
      return new RegExp(str)
    })({ default: /raw-payloads/ }),
    KAFKA_PAYLOAD_ROUTING_PREFIX: envalid.str({ default: 'payloads' }),
    THINGS_SERVICE_HOST: envalid.host({ default: 'wasp-thing-service' }),
    THINGS_SERVICE_PORT: envalid.port({ default: 3000 }),
  },
  {
    strict: true,
  }
)

export default {
  ...vars,
}
