import * as core from '@actions/core'
import {
  AppRunnerClient,
  DescribeServiceCommand,
  PauseServiceCommand
} from '@aws-sdk/client-apprunner' // ES Modules import
import { sleep } from './sleep'


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
    const input = {
      ServiceArn: serviceArn // required
    }
    const describeCommand = new DescribeServiceCommand(input)
    let isReady = false
    do {
      const response = await client.send(describeCommand)
      if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
        // need to wait again
        core.info(
          `Service Status: ${response.Service?.Status}. Wait for ${wait}s.`
        )
        await sleep(wait * 1000) // wait 1s
      } else {
        isReady = true
      }
    } while (!isReady)
    // re-pause the service
    const command = new PauseServiceCommand(input)
    const response = await client.send(command)
    if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
      // need to pause
      core.info('Service has been paused.')
    } else {
      // do nothing, but what happen?
      core.info(`The service state is ${response.Service?.Status}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
