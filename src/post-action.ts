import * as core from '@actions/core'
import {AppRunnerClient, PauseServiceCommand} from '@aws-sdk/client-apprunner' // ES Modules import
import {waitAppRunner, waitAppRunnerUntil} from './wait'

async function run(): Promise<void> {
  try {
    const pauseState = core.getState('need_pause')
    if (pauseState !== 'TRUE') {
      core.debug(`State: ${pauseState}`)
      core.debug(`State type: ${typeof pauseState}`)
      core.info('Do Nothing.')
      return
    }
    core.info('Pausing Service...')
    const serviceArn: string = core.getInput('arn')
    const waitingTime: string = core.getInput('wait')
    const wait = parseInt(waitingTime)
    const region: string = core.getInput('region')
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
      core.info('Service has been paused.')
      const endTime = new Date()
      const seconds = (endTime.getTime() - startTime.getTime()) / 1000
      core.summary
        .addHeading('Prepare AppRunner Result')
        .addRaw(`Pausing time: ${seconds} seconds`)
        .write()
    } else {
      // do nothing, but what happen?
      core.info(`The service state is ${response.Service?.Status}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
