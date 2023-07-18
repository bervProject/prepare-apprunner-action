import * as core from '@actions/core'
import {AppRunnerClient, ResumeServiceCommand} from '@aws-sdk/client-apprunner' // ES Modules import

async function run(): Promise<void> {
  try {
    const serviceArn: string = core.getInput('arn')
    const region: string = core.getInput('region')
    const client = new AppRunnerClient({
      region
    })
    const input = {
      // ResumeServiceRequest
      ServiceArn: serviceArn // required
    }
    const command = new ResumeServiceCommand(input)
    const response = await client.send(command)
    if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
      // need to pause
      core.saveState('need_pause', 'TRUE')
      core.info('Service has been started.')
    } else if (response.Service?.Status === 'RUNNING') {
      // do nothing
      core.info('Service is running.')
    } else {
      // do nothing, but what happen?
      core.info(`The service state is ${response.Service?.Status}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
