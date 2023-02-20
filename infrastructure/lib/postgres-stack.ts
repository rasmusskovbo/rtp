import * as cdk from 'aws-cdk-lib';
import { Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface PostgresStackProps extends StackProps {
    vpc: Vpc;
    dbIdentifier: string;
}

export class PostgresStack extends cdk.Stack {
    readonly db: DatabaseInstance;
    readonly password: Secret;

    constructor(scope: Construct, id: string, props: PostgresStackProps) {
        super(scope, id, props);

        this.password = new Secret(this, `${id}-PasswordSecret`, {
            generateSecretString: {
                excludePunctuation: true
            }
        })

        this.db = new DatabaseInstance(this, id, {
            vpc: props.vpc,
            engine: DatabaseInstanceEngine.postgres({
                version: PostgresEngineVersion.VER_14_5,
            }),
            // https://aws.amazon.com/rds/instance-types/
            instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MICRO),
            credentials: {
                username: props.dbIdentifier,
                password: this.password.secretValue
            },
            allocatedStorage: 10,
            backupRetention: Duration.days(7),
            deletionProtection: true,
            databaseName: props.dbIdentifier,
            removalPolicy: RemovalPolicy.RETAIN
        })
    }
}

