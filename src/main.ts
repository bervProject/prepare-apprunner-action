import {getInput, saveState, info, summary, setFailed} from '@actions/core'
import {AppRunnerClient, ResumeServiceCommand} from '@aws-sdk/client-apprunner' // ES Modules import
import {waitAppRunner, waitAppRunnerUntil} from './wait'

async function run(): Promise<void> {
  try {
    const serviceArn: string = getInput('arn')
    const region: string = getInput('region')
    const waitUntil: string = getInput('wait')
    const wait = parseInt(waitUntil)
    const client = new AppRunnerClient({
      region
    })
    const startTime = new Date()
    await waitAppRunner({
      client,
      wait,
      serviceArn
    })
    const input = {
      // ResumeServiceRequest
      ServiceArn: serviceArn // required
    }
    const command = new ResumeServiceCommand(input)
    const response = await client.send(command)
    if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
      // need to pause
      saveState('need_pause', 'TRUE')
      await waitAppRunnerUntil({
        client,
        wait,
        serviceArn,
        endStatus: 'RUNNING'
      })
      info('Service has been started.')
      const endTime = new Date()
      const seconds = (endTime.getTime() - startTime.getTime()) / 1000
      summary
        .addHeading('Prepare AppRunner Result')
        .addRaw(`Starting time: ${seconds} seconds`)
        .write()
    } else if (response.Service?.Status === 'RUNNING') {
      // do nothing
      info('Service is running.')
    } else {
      // do nothing, but what happen?
      info(`The service state is ${response.Service?.Status}`)
    }
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
