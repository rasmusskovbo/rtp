import * as cdk from 'aws-cdk-lib';

export interface GlobalStackProps extends cdk.StackProps {
    projectName: string
}