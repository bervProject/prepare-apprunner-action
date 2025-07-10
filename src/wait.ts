import {info} from '@actions/core'
import {
  AppRunnerClient,
  DescribeServiceCommand
} from '@aws-sdk/client-apprunner'
import {sleep} from './sleep'

async function waitAppRunner({
  client,
  serviceArn,
  wait
}: {
  client: AppRunnerClient
  serviceArn: string
  wait: number
}): Promise<void> {
  const input = {
    ServiceArn: serviceArn // required
  }
  const describeCommand = new DescribeServiceCommand(input)
  let isReady = false
  do {
    const response = await client.send(describeCommand)
    if (response.Service?.Status === 'OPERATION_IN_PROGRESS') {
      // need to wait again
      info(`Service Status: ${response.Service?.Status}. Wait for ${wait}s.`)
      await sleep(wait * 1000) // wait 1s
    } else {
      info(`Service status now: ${response.Service?.Status}`)
      isReady = true
    }
  } while (!isReady)
}

async function waitAppRunnerUntil({
  client,
  serviceArn,
  wait,
  endStatus
}: {
  client: AppRunnerClient
  serviceArn: string
  wait: number
  endStatus: 'RUNNING' | 'PAUSED'
}): Promise<void> {
  let isReady = false
  do {
    info(`Wait for ${wait}s until service status is ${endStatus}.`)
    await sleep(wait * 1000)
    const describeCommand = new DescribeServiceCommand({
      ServiceArn: serviceArn
    })
    const describeResponse = await client.send(describeCommand)
    if (describeResponse.Service?.Status === endStatus) {
      isReady = true
    }
  } while (!isReady)
}

export {waitAppRunner, waitAppRunnerUntil}
