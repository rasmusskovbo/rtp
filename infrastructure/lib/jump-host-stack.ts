import * as cdk from 'aws-cdk-lib';

import { BastionHostLinux, Vpc } from 'aws-cdk-lib/aws-ec2';
import ec2 = require('aws-cdk-lib/aws-ec2');
import s3 = require('aws-cdk-lib/aws-s3');
import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { GlobalStackProps } from './global-stack-props';

interface JumpHostStackProps extends GlobalStackProps {
    vpc: Vpc;
}

// Investigate setting up jumphost
export class JumpHostStack extends cdk.Stack {
    readonly jumpHost: BastionHostLinux;
    readonly jumphostBucket: Bucket;

    constructor(scope: Construct, id: string, props: JumpHostStackProps) {
        super(scope, id, props);

        // S3 bucket for downloading files from jumphost
        this.jumphostBucket = new s3.Bucket(this, 'JumphostBucket', {
          bucketName: `${props.projectName.toLowerCase()}-jumphostbucket`,
          blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
          removalPolicy: RemovalPolicy.DESTROY
        });

        // nano instance with built-in SSM agent
        this.jumpHost = new ec2.BastionHostLinux(this, id, {
            vpc: props.vpc
        })

        this.jumphostBucket.grantPut(this.jumpHost.role);
        this.jumphostBucket.grantRead(this.jumpHost.role);

        // Investigate, should install correct cli's and need to investigate how to verify SSH keys (how to upload to server)
        this.jumpHost.instance.userData.addCommands(
          'amazon-linux-extras install -y postgresql10',
          'amazon-linux-extras install -y redis4.0'
        )
    }
}
