import * as cdk from 'aws-cdk-lib'
import { Duration } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props';

export class GlobalInfrastructureStack extends cdk.Stack {
    public readonly repository: Repository;
    public readonly dockerHubUsername: string;
    public readonly dockerHubAccessToken: Secret;

    constructor(scope: Construct, id: string, props: GlobalStackProps) {
        super(scope, id, props)
        
        this.repository = new Repository(this, `${props.projectName}-Repository`, {})
        this.repository.addLifecycleRule({ maxImageAge: Duration.days(3), maxImageCount: 3})
    
        this.dockerHubUsername = "roadtopink"
        this.dockerHubAccessToken = new Secret(this, "DockerHubAccessToken", {})
    }
    
}