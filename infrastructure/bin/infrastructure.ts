#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { RedisStack } from '../lib/redis-stack';
import { PostgresStack } from '../lib/postgres-stack';
import {GlobalInfrastructureStack} from "../lib/global-infrastructure";

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
  dbIdentifier: dbIdentifier,
  vpc: globalInfrastructureStack.vpc
})

new AppStack(app, `${projectName}-AppStack`, {
  projectName: projectName,
  vpc: globalInfrastructureStack.vpc,
  redisHost: redisStack.cacheCluster.attrRedisEndpointAddress,
  redisPort: redisStack.cacheCluster.attrRedisEndpointPort,
  dbHost: postgresStack.db.dbInstanceEndpointAddress,
  dbPort: postgresStack.db.dbInstanceEndpointPort,
  dbName: dbIdentifier,
  dbUser: dbIdentifier,
  dbPassword: postgresStack.password
})