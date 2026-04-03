import {mockClient} from 'aws-sdk-client-mock'
import {
  AppRunnerClient,
  DescribeServiceCommand,
  ResumeServiceCommand,
  PauseServiceCommand
} from '@aws-sdk/client-apprunner'
import {sleep} from '../src/sleep.js'
import {waitAppRunner, waitAppRunnerUntil} from '../src/wait.js'

const appRunnerClientMock = mockClient(AppRunnerClient)

beforeEach(() => {
  appRunnerClientMock.reset()
})

test('sleep resolves after delay', async () => {
  const start = Date.now()
  await sleep(300)
  expect(Date.now() - start).toBeGreaterThanOrEqual(290)
})

test('waitAppRunner resolves immediately when not in progress', async () => {
  appRunnerClientMock.on(DescribeServiceCommand).resolves({
    Service: {
      Status: 'RUNNING',
      ServiceId: '1',
      ServiceName: 'test',
      ServiceArn: 'arn',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      ServiceUrl: '',
      InstanceConfiguration: {},
      SourceConfiguration: {},
      HealthCheckConfiguration: {},
      AutoScalingConfigurationSummary: {},
      NetworkConfiguration: {}
    }
  })
  const client = new AppRunnerClient({region: 'us-east-1'})
  await expect(
    waitAppRunner({client, serviceArn: 'arn', wait: 1})
  ).resolves.toBeUndefined()
})

test('waitAppRunnerUntil resolves when status matches', async () => {
  appRunnerClientMock.on(DescribeServiceCommand).resolves({
    Service: {
      Status: 'RUNNING',
      ServiceId: '1',
      ServiceName: 'test',
      ServiceArn: 'arn',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      ServiceUrl: '',
      InstanceConfiguration: {},
      SourceConfiguration: {},
      HealthCheckConfiguration: {},
      AutoScalingConfigurationSummary: {},
      NetworkConfiguration: {}
    }
  })
  const client = new AppRunnerClient({region: 'us-east-1'})
  await expect(
    waitAppRunnerUntil({
      client,
      serviceArn: 'arn',
      wait: 1,
      endStatus: 'RUNNING'
    })
  ).resolves.toBeUndefined()
})
