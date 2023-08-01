import * as cdk from 'aws-cdk-lib'
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props';

export class GlobalInfrastructureStack extends cdk.Stack {
    public readonly vpc: Vpc;

    constructor(scope: Construct, id: string, props: GlobalStackProps) {
        super(scope, id, props)
        this.vpc = new Vpc(this, `${id}-Vpc`, {
            maxAzs: 2,
            subnetConfiguration: [
              {
                name: "public",
                subnetType: SubnetType.PUBLIC
              },
                {
                    name: "private",
                    subnetType: SubnetType.PRIVATE_WITH_EGRESS
                }
            ]
        })
    }
    
}