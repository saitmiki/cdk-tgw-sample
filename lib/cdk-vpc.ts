import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs"

import {
    FlowLogDestination,
    FlowLogTrafficType,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2"

interface StackConfig extends StackProps {
    readonly vpc_cidr: string
}

const test_cdk_vpc:string = "test-cdk-vpc"
const testCdkVpcOutput:string = "testCdkVpcOutput"

export class CdkNetowrkStack extends Stack {
    public readonly vpc: Vpc

    constructor(scope: Construct, id: string, props: StackConfig) {
        super(scope, id, props)

        // This is actual infomration to make vpc
        this.vpc = new Vpc(this, test_cdk_vpc, {
            cidr: props.vpc_cidr,
            maxAzs: 3,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            flowLogs: {
                Reject: { destination: FlowLogDestination.toCloudWatchLogs(), trafficType: FlowLogTrafficType.REJECT }
            },
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: "Ingress",
                    subnetType: SubnetType.PUBLIC
                },
                {
                    cidrMask: 24,
                    name: "Private",
                    subnetType: SubnetType.PRIVATE_ISOLATED
                }
            ]
        })
        new CfnOutput(this, testCdkVpcOutput,
            {
                value: this.vpc.vpcId,
                description: "This vpc is created by CDK.",
                exportName: testCdkVpcOutput
            }
        )
    }



}
