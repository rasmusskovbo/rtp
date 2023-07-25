import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props';

export class GlobalInfrastructureStack extends cdk.Stack {
    public readonly repository: Repository;
    public readonly dockerHubUsername: string;
    public readonly dockerHubAccessToken: Secret;
    public readonly bucket: Bucket;
    public readonly vpc: Vpc;
    //public_old readonly loadBalancer: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: GlobalStackProps) {
        super(scope, id, props)
        
        this.repository = new Repository(this, `${props.projectName}-Repository`, {})
        this.repository.addLifecycleRule({maxImageCount: 3})
    
        this.dockerHubUsername = "roadtopink"
        this.dockerHubAccessToken = new Secret(this, "DockerHubAccessToken", {})

        this.bucket = new Bucket(this, `${props.projectName.toLowerCase()}-bucket`, {
            removalPolicy: RemovalPolicy.RETAIN
        })

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
      
        /*
        this.loadBalancer = new ApplicationLoadBalancer(this, 'PublicLB', {
            vpc: this.vpc,
            deletionProtection: true,
            internetFacing: true,
            idleTimeout: Duration.seconds(15)
        });
        */
    }
    
}