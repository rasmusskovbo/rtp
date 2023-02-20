#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { GlobalInfrastructureStack } from '../lib/global-infrastructure';
import { RedisStack } from '../lib/redis-stack';
import { PostgresStack } from '../lib/postgres-stack';
import { JumpHostStack } from '../lib/jump-host-stack';

const app = new cdk.App();

const projectName = "Road-To-Pink"
const dbIdentifier = "rtp"

const globalInfrastructureStack = new GlobalInfrastructureStack(app, `${projectName}-GlobalInfrastructure`, {
  projectName: projectName,
})

const redisStack = new RedisStack(app, `${projectName}-RedisStack`, {
  vpc: globalInfrastructureStack.vpc,
})

const postgresStack = new PostgresStack(app, `${projectName}-PostgresStack`, {
  vpc: globalInfrastructureStack.vpc,
  dbIdentifier: dbIdentifier
})

const jumpHost = new JumpHostStack(app, `${projectName}-JumpHostStack`, {
  vpc: globalInfrastructureStack.vpc,
  projectName: projectName
})

jumpHost.jumpHost.connections.allowToDefaultPort(redisStack)
jumpHost.jumpHost.connections.allowToDefaultPort(postgresStack.db)

const appStack = new AppStack(app, `${projectName}-AppStack`, {
  projectName: projectName,
  vpc: globalInfrastructureStack.vpc,
  repository: globalInfrastructureStack.repository,
  redisHost: redisStack.cacheCluster.attrRedisEndpointAddress,
  redisPort: redisStack.cacheCluster.attrRedisEndpointPort,
  dbHost: postgresStack.db.dbInstanceEndpointAddress,
  dbPort: postgresStack.db.dbInstanceEndpointPort,
  dbName: dbIdentifier,
  dbUser: dbIdentifier,
  dbPassword: postgresStack.password,
  bucket: globalInfrastructureStack.bucket
})

appStack.fargateService.connections.allowToDefaultPort(redisStack)
appStack.fargateService.connections.allowToDefaultPort(postgresStack.db)
jumpHost.jumphostBucket.grantPut(appStack.fargateService.taskDefinition.taskRole)

// TODO -> CI/CD stack (måske PR tester også?)
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */