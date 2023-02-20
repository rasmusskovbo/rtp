
import * as cdk from 'aws-cdk-lib';
import { Connections, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnCacheCluster, CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache';
import { Construct } from 'constructs';

interface RedisStackProps extends cdk.StackProps {
    vpc: Vpc;
}

export class RedisStack extends cdk.Stack {
    readonly cacheCluster: CfnCacheCluster;
    readonly connections: Connections;

    constructor(scope: Construct, id: string, props: RedisStackProps) {
        super(scope, id, props);

        const subnetGroup = new CfnSubnetGroup(this, `${id}-SubnetGroup`, {
            cacheSubnetGroupName: `-${id}-SubnetGroup`,
            description: `List of subnets used for redis cache ${id}`,
            subnetIds: props.vpc.privateSubnets.map(subnet => subnet.subnetId)
        });

        const securityGroup = new SecurityGroup(this, `${id}-SecurityGroup`, { 
            securityGroupName: `${id}-SecurityGroup`,
            vpc: props.vpc
        });

        this.connections = new Connections({
            securityGroups: [ securityGroup ],
            defaultPort: Port.tcp(6379)
        });

        this.cacheCluster = new CfnCacheCluster(this, "Redis", {
            cacheNodeType: 'cache.t3.micro', // check prices
            engine: 'redis',
            numCacheNodes: 1,
            autoMinorVersionUpgrade: true,
            cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
            vpcSecurityGroupIds: [
                securityGroup.securityGroupId,
            ]
        });
    }
}