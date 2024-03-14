# wasp-routing-service

## Deprecation Notice
`WASP` was deprecated on March 14th 2024, there will be no further dependency or security updates to this platform.
---

Routing Service for WASP Project. This service will take payloads associated with an ingest specific id, lookup the corresponding thing and then forward the payload to the appropriate payload processor service.

## Getting started

`wasp-routing-service` can be run in a similar way to most nodejs application. First install required dependencies using `npm`:

```sh
npm install
```

`wasp-routing-service` depends on a `kafka` instance as a dependency which can be brought locally up using docker:

```sh
docker-compose up -d
```

And finally you can run the application in development mode with:

```sh
npm run dev
```

Or run tests with:

```sh
npm test
```

## Environment Variables

`wasp-routing-service` is configured primarily using environment variables as follows:

| variable                     | required |       default        | description                                                                               |
| :--------------------------- | :------: | :------------------: | :---------------------------------------------------------------------------------------- |
| LOG_LEVEL                    |    N     |        `info`        | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]      |
| PORT                         |    N     |        `3001`        | Port on which the service will listen                                                     |
| KAFKA_LOG_LEVEL              |    N     |      `nothing`       | Logging level for kafkajs. Valid values are [`debug`, `info`, `warn`, `error`, `nothing`] |
| KAFKA_BROKERS                |    N     |   `localhost:9092`   | Comma separated list of initial Kafka brokers to connect to                               |
| KAFKA_PAYLOAD_TOPIC          |    N     |    `raw-payloads`    | Kafka topic to listen for raw payloads on                                                 |
| KAFKA_PAYLOAD_ROUTING_PREFIX |    N     |      `payloads`      | Prefix for topic names for specific payload processor services                            |
| THINGS_SERVICE_HOST          |    N     | `wasp-thing-service` | Hostname to connect to a deployed thing-service                                           |
| THINGS_SERVICE_PORT          |    N     |        `3000`        | Port to connect to a deployed thing-service                                               |

## Deploying WASP Routing Service on WASP-Cluster with Helm/Kubernetes

### Install

```
brew install minikube helm
```

### WASP-Cluster

Obtain the `wasp-cluster` from the repo: `https://github.com/digicatapult/wasp-cluster.git`, and follow the readme instructions.

Eval is required to provide helm with visibility for your local docker image repository:

```
eval $(minikube docker-env)
```

Build the docker image:

```
docker build -t wasp-routing-service .
```

To run/deploy the application on kubernetes via helm charts use the following values.yaml with the corresponding overrides:

```
helm install wasp-routing-service helm/wasp-routing-service -f helm/wasp-routing-service/ci/ct-values.yaml
```
