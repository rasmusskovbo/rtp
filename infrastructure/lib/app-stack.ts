import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GlobalStackProps } from './global-stack-props'
import {
  aws_cloudfront,
  aws_cloudfront_origins, aws_ecr,
  aws_elasticbeanstalk, aws_iam, aws_s3_assets,
  aws_s3_deployment,
  RemovalPolicy
} from "aws-cdk-lib";
import {Repository} from "aws-cdk-lib/aws-ecr";
import {CfnApplication, CfnApplicationVersion, CfnEnvironment} from "aws-cdk-lib/aws-elasticbeanstalk";
import {latestVersionIfHigher} from "aws-cdk/lib/version";
import {Asset} from "aws-cdk-lib/aws-s3-assets";
import {CfnInstanceProfile, ManagedPolicy} from "aws-cdk-lib/aws-iam";

interface AppStackProps extends GlobalStackProps {
  vpc: Vpc,
  redisHost: string,
  redisPort: string
  dbHost: string,
  dbPort: string,
  dbName: string,
  dbUser: string,
  dbPassword: Secret
  //zone Route 53 hosted zone data
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Bucket for CDN
     const cdnBucket = new Bucket(this, `${props.projectName.toLowerCase()}-frontend-bucket`, {
      removalPolicy: RemovalPolicy.DESTROY // testing
    })

    const uploadBucket = new Bucket(this, `${props.projectName.toLowerCase()}-upload-bucket`, {
      removalPolicy: RemovalPolicy.DESTROY // testing
    })

    // Create a new CloudFront distribution with the bucket as its origin
    const distribution = new aws_cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new aws_cloudfront_origins.S3Origin(cdnBucket) },
    });

     /*
    // Create an ACM certificate for https
    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: 'your-domain-name',
      hostedZone: route53.HostedZone.fromLookup(this, 'Zone', {
        domainName: 'your-domain-name',
      }),
    });
      */

    // Route 53 for RTP domain

    // Deploy the Next.js frontend to the S3 bucket
    new aws_s3_deployment.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [aws_s3_deployment.Source.asset('../frontend/.next')], // TODO check this path
      destinationBucket: cdnBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    ////// BACKEND
    const appRole = new aws_iam.Role(this, 'AppRole', {
      assumedBy: new aws_iam.ServicePrincipal('elasticbeanstalk.amazonaws.com'),
    });

    appRole.addToPolicy(new aws_iam.PolicyStatement({
      effect: aws_iam.Effect.ALLOW,
      resources: [uploadBucket.bucketArn, `${uploadBucket.bucketArn}/*`],
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
    }));

    const appInstanceProfile = new CfnInstanceProfile(this, 'AppInstanceProfile', {
      roles: [appRole.roleName],
    });

    const fullAccessPolicy = ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-AWSElasticBeanstalk');
    appRole.addManagedPolicy(fullAccessPolicy);

    // Construct an S3 asset Zip from directory up.
    const webAppZipArchive = new Asset(this, 'BackendZip', {
      path: `${__dirname}/../../backend/dist`,
    });

    // elastic beanstalk app
    const ebApp = new CfnApplication(this, 'RoadToPink-Application', {
      applicationName: props.projectName,
    });

    // app version:
    // Create an app version from the S3 asset defined earlier
    const appVersionProps = new CfnApplicationVersion(this, 'AppVersion', {
      applicationName: props.projectName,
      sourceBundle: {
        s3Bucket: webAppZipArchive.s3BucketName,
        s3Key: webAppZipArchive.s3ObjectKey,
      },
    });

    // Make sure that Elastic Beanstalk app exists before creating an app version
    appVersionProps.addDependency(ebApp);

    // beanstalk env setup
    const env = new CfnEnvironment(this, 'Environment', {
      environmentName: props.projectName,
      applicationName: ebApp.applicationName!,
      solutionStackName: '64bit Amazon Linux 2 v5.8.4 running Node.js 18',
      versionLabel: appVersionProps.ref,
      optionSettings: [
        {
          namespace: 'aws:ec2:vpc',
          optionName: 'VPCId',
          value: props.vpc.vpcId,
        },
        {
          namespace: 'aws:ec2:vpc',
          optionName: 'Subnets',
          value: props.vpc.selectSubnets().subnetIds.join(','),
        },
        {
          namespace: 'aws:autoscaling:launchconfiguration',
          optionName: 'IamInstanceProfile',
          value: appInstanceProfile.ref,
        },
        {
          namespace: 'aws:autoscaling:asg',
          optionName: 'MinSize',
          value: "1"
        },
        {
          namespace: 'aws:autoscaling:asg',
          optionName: 'MaxSize',
          value: "1"
        },
        {
          namespace: 'aws:ec2:instances',
          optionName: 'InstanceTypes',
          value: 't2.micro',
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'CORS_ORIGIN',
          value: `https://${distribution.distributionDomainName}`,  // Use CloudFront domain name
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'DB_HOST',
          value: props.dbHost,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'DB_PASSWORD',
          value: props.dbPassword.secretValue.unsafeUnwrap(),
        },
          // todo add DB_PASSWORD for typeorm
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'DB_PASSWORD_SECRET',
          value: props.dbPassword.secretArn,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'DB_USER',
          value: props.dbUser,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'DB_NAME',
          value: props.dbName,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'REDIS_HOST',
          value: props.redisHost,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'REDIS_PORT',
          value: props.redisPort,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'S3_BUCKET_NAME',
          value:uploadBucket.bucketName,
        },
        {
          namespace: 'aws:elasticbeanstalk:application:environment',
          optionName: 'AWS_REGION',
          value: this.region,
        }
      ]
    });

  }
}
