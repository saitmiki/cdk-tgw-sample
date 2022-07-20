import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs"
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import {
    FlowLogDestination,
    FlowLogTrafficType,
    SubnetType,
    Vpc,
} from "aws-cdk-lib/aws-ec2"
import {StringParameter,ParameterType} from "aws-cdk-lib/aws-ssm";

interface StackConfig extends StackProps {
    readonly vpc_cidr: string
}

const test_cdk_vpc:string = "test-cdk-vpc"

export class CdkNetowrkStack extends Stack {
    public readonly vpc: Vpc

    constructor(scope: Construct, id: string, props: StackConfig) {
        super(scope, id, props)

        // This is actual infomration to make vpc
        this.vpc = new Vpc(this, test_cdk_vpc, {
            cidr: props.vpc_cidr,
            maxAzs: 2,
            enableDnsHostnames: true,
            enableDnsSupport: true,
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
        // create an SSM parameters which store export VPC ID
        new StringParameter(this, 'VPCID', {
            parameterName: test_cdk_vpc,
            stringValue: this.vpc.vpcId,
            type: ParameterType.STRING,
        })
    }
}
