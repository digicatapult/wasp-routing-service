# JMETER

## Requirements
JDK 8
JMeter 5.4.1
JMETER_HOME added to %PATH
Thing Service
Route Service

## Setup
### JMeter
```
vi {JMETER_HOME}/bin/setenv.sh

# add the following...
HEAP="-Xms1g -Xmx4g -XX:MaxMetaspaceSize=256m"
```
The following files are required that each contain a string to the size of:
1) 100kb
2) 200kb
3) 500kb
4) 900kb

### Thing Service
ThingService will need seed data for the thing to be successfully looked up via ingest and ingestId
```
cd ../
git clone https://github.com/digicatapult/wasp-thing-service.git
cd wasp-thing-service
npm i

# migrations script:
npx knex migrate:latest

#seed data script:
NODE_ENV=test npx knex seed:run

#start thing service
HOST=localhost PORT=3000 npm run dev
```

### Routing Service
```
docker-compose up
THINGS_SERVICE_HOST=localhost npm run dev
```

## Start
```
jmeter -t ./test/jmeter/Test_Plan_01.jmx
``` 
The required path for the data file will need to be amended within the script.
