import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props'

interface AppStackProps extends GlobalStackProps {
  repository: Repository
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, `${props.projectName}-Vpc`, {
      maxAzs: 2,
    })

    const cluster = new Cluster(this, `${props.projectName}-Cluster`,)
  }
}
