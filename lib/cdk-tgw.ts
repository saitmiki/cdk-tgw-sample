import { Stack, CfnOutput, Fn } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { Construct } from "constructs";

import { 
    CfnTransitGateway,
    CfnTransitGatewayRouteTable,
    CfnTransitGatewayAttachment,
    CfnTransitGatewayRouteTableAssociation,
    CfnTransitGatewayRouteTablePropagation,
    CfnTransitGatewayRoute
} from "aws-cdk-lib/aws-ec2";

const testCdkTgw:string = "testCdkTgw"
const testCdkTgwAttach:string = "testCdkTgwAttach"
const testCdkTgwRt:string = "testCdkTgwRt"
const testCdkTgwRtAssociate:string = "testCdkTgwRtAssociate"
const testCdkTgwRtAssociateSaitmiki:string = "testCdkTgwRtAssociateSaitmiki"
const testCdkTgwRtPropagation:string = "testCdkTgwRtPropagation"
const testCdkTgwRtPropagationSaitmiki:string = "testCdkTgwRtPropagationSaitmiki"
const testCdkTgwRoute:string = "testCdkTgwRoute"
const testCdkTgwRouteSaitmiki:string = "testCdkTgwRouteSaitmiki"

export class CdkTgwStack extends Stack {

    public readonly tgw: CfnTransitGateway
    public readonly tgwRt: CfnTransitGatewayRouteTable
    public readonly tgwAttach:CfnTransitGatewayAttachment
    public readonly tgwRtAssociate:CfnTransitGatewayRouteTableAssociation
    public readonly tgwRtAssociateSaitmiki:CfnTransitGatewayRouteTableAssociation
    public readonly tgwRtPropagation:CfnTransitGatewayRouteTablePropagation
    public readonly tgwRtPropagationSaitmiki:CfnTransitGatewayRouteTablePropagation
    public readonly tgwRoute:CfnTransitGatewayRoute
    public readonly tgwRouteSaitmiki:CfnTransitGatewayRoute

    constructor(scope: Construct, id: string) {
        super(scope, id)
        const cfnTgwProps: ec2.CfnTransitGatewayProps = {
            amazonSideAsn: 65002,
            tags: [{
                key: 'Name',
                value: testCdkTgw,
            }],
        }
        // TGW作成
        this.tgw = new CfnTransitGateway(this, testCdkTgw, cfnTgwProps)

        // property for tgw attachment
        this.tgwAttach = new CfnTransitGatewayAttachment(this, testCdkTgwAttach,{
            subnetIds: ['subnet-0b89e76ad95335c1f','subnet-02cc1d6412e2cd2d0'],
            transitGatewayId: this.tgw.ref,
            vpcId: "vpc-017b05b63d77f0021",
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

        // Assotiation for route table
        this.tgwRtAssociate = new CfnTransitGatewayRouteTableAssociation(this, testCdkTgwRtAssociate,{
            transitGatewayAttachmentId: this.tgwAttach.ref,
            transitGatewayRouteTableId: this.tgwRt.ref
        })
        this.tgwRtAssociate.addDependsOn(this.tgwAttach)
        this.tgwRtAssociate.addDependsOn(this.tgwRt)

        this.tgwRtAssociateSaitmiki = new CfnTransitGatewayRouteTableAssociation(this, testCdkTgwRtAssociateSaitmiki,{
            transitGatewayAttachmentId: "tgw-attach-0f29209beba5df6ca",
            transitGatewayRouteTableId: this.tgwRt.ref
        })
        this.tgwRtAssociateSaitmiki.addDependsOn(this.tgwRt)
        
        // Propagation for route table1
        this.tgwRtPropagation = new CfnTransitGatewayRouteTablePropagation(this, testCdkTgwRtPropagation,{
            // Attachment for test-vpc 
            transitGatewayAttachmentId:this.tgwAttach.ref,
            transitGatewayRouteTableId:this.tgwRt.ref
        })
        this.tgwRtPropagation.addDependsOn(this.tgwAttach)
        this.tgwRtPropagation.addDependsOn(this.tgwRt)
        
        // Propagation for route table2
        this.tgwRtPropagationSaitmiki = new CfnTransitGatewayRouteTablePropagation(this, testCdkTgwRtPropagationSaitmiki,{
            // Attachment for test-vpc propagation to target vpc attachment
            transitGatewayAttachmentId:"tgw-attach-0f29209beba5df6ca",
            transitGatewayRouteTableId:this.tgwRt.ref
        })
        this.tgwRtPropagation.addDependsOn(this.tgwAttach)
        this.tgwRtPropagation.addDependsOn(this.tgwRt)
    }
}