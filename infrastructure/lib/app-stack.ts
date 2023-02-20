import * as cdk from 'aws-cdk-lib';
import { SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Cluster, ContainerImage, FargateService } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props'

interface AppStackProps extends GlobalStackProps {
  vpc: Vpc,
  repository: Repository,
  redisHost: string,
  redisPort: string
  dbHost: string,
  dbPort: string,
  dbName: string,
  dbUser: string,
  dbPassword: Secret
  bucket: Bucket
  //loadBalancer: ApplicationLoadBalancer
  //zone Route 53 hosted zone data
}

export class AppStack extends cdk.Stack {
  readonly fargateService: FargateService;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const cluster = new Cluster(this, `${props.projectName}-Cluster`, {
      vpc: props.vpc
    })

    // Provide ECS example integr as well, Fargate version below
    const fargateService = new ApplicationLoadBalancedFargateService(this, `${props.projectName}-Cluster`, {
      cluster: cluster,
      taskImageOptions: { 
        image: ContainerImage.fromEcrRepository(props.repository, "TAG"),
        environment: {
          "PORT": "80",
          "REDIS_HOST": props.redisHost,
          "REDIS_PORT": props.redisPort,
          "DB_HOST": props.dbHost,
          "DB_USER": props.dbUser,
          "DB_NAME": props.dbName,
          "S3_BUCKET_NAME": props.bucket.bucketName,
          //"LOAD_BALANCER_ARN": props.loadBalancer.loadBalancerArn
        },
        secrets: {
          "DB_PASSWORD": cdk.aws_ecs.Secret.fromSecretsManager(props.dbPassword)
        }
      }
    })

    props.bucket.grantReadWrite(fargateService.taskDefinition.taskRole)
    this.fargateService = fargateService.service;

    // Next step, setup CI/CD & connect redis + postgres
    // Use redis/postgres to setup connections with fargateService -> provide the port details in the container env automatically
    // Check for other relevant or interesting features to include.
    


  }
}
