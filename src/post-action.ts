import {
  getState,
  debug,
  info,
  getInput,
  summary,
  setFailed
} from '@actions/core'
import {AppRunnerClient, PauseServiceCommand} from '@aws-sdk/client-apprunner' // ES Modules import
import {waitAppRunner, waitAppRunnerUntil} from './wait'

async function run(): Promise<void> {
  try {
    const pauseState = getState('need_pause')
    if (pauseState !== 'TRUE') {
      debug(`State: ${pauseState}`)
      debug(`State type: ${typeof pauseState}`)
      info('Do Nothing.')
      return
    }
    info('Pausing Service...')
    const serviceArn: string = getInput('arn')
    const waitingTime: string = getInput('wait')
    const wait = parseInt(waitingTime)
    const region: string = getInput('region')
    const client = new AppRunnerClient({
      region
    })
    const startTime = new Date()
    await waitAppRunner({
      client,
      wait,
      serviceArn
    })
    // re-pause the service
    const input = {
      ServiceArn: serviceArn // required
    }
    const command = new PauseServiceCommand(input)
    const response = await client.send(command)
    if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
      // need to pause
      await waitAppRunnerUntil({
        client,
        wait,
        serviceArn,
        endStatus: 'PAUSED'
      })
      info('Service has been paused.')
      const endTime = new Date()
      const seconds = (endTime.getTime() - startTime.getTime()) / 1000
      summary
        .addHeading('Prepare AppRunner Result')
        .addRaw(`Pausing time: ${seconds} seconds`)
        .write()
    } else {
      // do nothing, but what happen?
      info(`The service state is ${response.Service?.Status}`)
    }
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
