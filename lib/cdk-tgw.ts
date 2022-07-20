import { Stack,StackProps} from "aws-cdk-lib";
import { Construct } from "constructs";

import {
    CfnTransitGatewayProps,
    CfnTransitGateway,
    CfnTransitGatewayRouteTable,
    CfnTransitGatewayAttachment,
    CfnTransitGatewayRouteTableAssociation,
    CfnTransitGatewayRouteTablePropagation,
    CfnTransitGatewayRoute,
    Vpc,
    SubnetType
} from "aws-cdk-lib/aws-ec2";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

const testCdkTgw:string = "testCdkTgw"
const testCdkTgwAttach:string = "testCdkTgwAttach"
const testCdkTgwRt:string = "testCdkTgwRt"
const testCdkTgwRtAssociate:string = "testCdkTgwRtAssociate"
const testCdkTgwRtPropagation:string = "testCdkTgwRtPropagation"

export class CdkTgwStack extends Stack {

    public readonly tgw: CfnTransitGateway
    public readonly tgwRt: CfnTransitGatewayRouteTable
    public readonly tgwAttach:CfnTransitGatewayAttachment
    public readonly tgwRtAssociate:CfnTransitGatewayRouteTableAssociation
    public readonly tgwRtPropagation:CfnTransitGatewayRouteTablePropagation
    public readonly tgwRtPropagationSaitmiki:CfnTransitGatewayRouteTablePropagation
    public readonly tgwRoute:CfnTransitGatewayRoute

    constructor(scope: Construct, id: string,props: StackProps) {
        super(scope, id,props)
        const cfnTgwProps: CfnTransitGatewayProps = {
            amazonSideAsn: 65002,
            tags: [{
                key: 'Name',
                value: testCdkTgw,
            }],
        }
        // TGW作成
        this.tgw = new CfnTransitGateway(this, testCdkTgw, cfnTgwProps)

        // property for tgw attachment
        const vpcId = StringParameter.valueFromLookup(this, 'test-cdk-vpc');
        const vpc = Vpc.fromLookup(this, 'VPC', {
            vpcId: vpcId,
          });
        const vpcSubnets = vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_ISOLATED })
        this.tgwAttach = new CfnTransitGatewayAttachment(this, testCdkTgwAttach,{
            subnetIds: vpcSubnets.subnetIds,
            transitGatewayId: this.tgw.ref,
            vpcId: vpcId,
            tags: [{
                key: 'Name',
                value: testCdkTgwAttach,
            }],
        })
        this.tgwAttach.addDependsOn(this.tgw)
        // // property for tgw route table
        this.tgwRt = new CfnTransitGatewayRouteTable(this, testCdkTgwRt, {
            transitGatewayId: this.tgw.ref,
                    tags: [{
                        key: 'Name',
                        value: testCdkTgwRt,
                    }],
            })
        this.tgwRt.addDependsOn(this.tgw)

        // // Assotiation for route table
        this.tgwRtAssociate = new CfnTransitGatewayRouteTableAssociation(this, testCdkTgwRtAssociate,{
            transitGatewayAttachmentId: this.tgwAttach.ref,
            transitGatewayRouteTableId: this.tgwRt.ref
        })
        this.tgwRtAssociate.addDependsOn(this.tgwAttach)
        this.tgwRtAssociate.addDependsOn(this.tgwRt)
        
        // // Propagation for route table
        this.tgwRtPropagation = new CfnTransitGatewayRouteTablePropagation(this, testCdkTgwRtPropagation,{
            // Attachment for test-vpc 
            transitGatewayAttachmentId:this.tgwAttach.ref,
            transitGatewayRouteTableId:this.tgwRt.ref
        })
        this.tgwRtPropagation.addDependsOn(this.tgwAttach)
        this.tgwRtPropagation.addDependsOn(this.tgwRt)
    }
}