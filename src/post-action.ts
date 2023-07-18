import * as core from '@actions/core'
import {AppRunnerClient, PauseServiceCommand} from '@aws-sdk/client-apprunner' // ES Modules import

async function run(): Promise<void> {
  try {
    const pauseState = core.getState('need_pause')
    if (pauseState !== 'YES') {
      core.info('Do Nothing.')
      return
    }
    // re-pause the service
    const serviceArn: string = core.getInput('arn');
    const region: string = core.getInput('region');
    const client = new AppRunnerClient({
      region
    });
    const input = {
      // ResumeServiceRequest
      ServiceArn: serviceArn // required
    }
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
