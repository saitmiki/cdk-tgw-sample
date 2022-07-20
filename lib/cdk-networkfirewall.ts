import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Vpc, SubnetType } from "aws-cdk-lib/aws-ec2"
import * as fw from 'aws-cdk-lib/aws-networkfirewall';
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs"

let listdomains: string[] = [
    '.docker.com',
    '.microsoft.com',
    '.amazonaws.com',
    'telemetry.invicti.com',
    'ctldl.windowsupdate.com',
    'updates.acunetix.com',
    'downloads.nessus.org',
    'plugins.nessus.org',
    '.aws.amazon.com',
    '.fedoraproject.org',
    'rhui3.us-east-1.aws.ce.redhat.com',
    '.download.windowsupdate.com',
    '.update.microsoft.com',
    '.windowsupdate.microsoft.com',
    '.slack.com',
    '.windows.com',
    '.duosecurity.com',
    '.okta.com',
    '.oktacdn.com',
    '.splunk.com',
    '.trendmicro.com',
    'idp.login.splunk.com',
    'manage.trendmicro.com',
];

export class CdkNetowrkFirewallStack extends Stack {

    public readonly domainallowlist: fw.CfnRuleGroup
    public readonly fw_policy: fw.CfnFirewallPolicy
    public readonly firewall: fw.CfnFirewall

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props)

        // property for tgw attachment
        const vpcId = StringParameter.valueFromLookup(this, 'test-cdk-vpc-networkfirewall');
        const vpc = Vpc.fromLookup(this, 'VPC', {
            vpcId: vpcId,
        });
        const subnetList = [];
        const subnets = vpc.selectSubnets({ subnetType: SubnetType.PRIVATE_ISOLATED })
        for (let i = 0; i < vpc.availabilityZones.length; i++) {
            const subnetMapping: fw.CfnFirewall.SubnetMappingProperty = { subnetId: subnets.subnetIds[i] };
            subnetList.push(subnetMapping);
        }
        
        // Network Firewall Rule
        this.domainallowlist = new fw.CfnRuleGroup(this, 'domain-allowlist', {
            capacity: 1000,
            ruleGroupName: 'domain-allowlist',
            type: 'STATEFUL',
            ruleGroup: {
                rulesSource: {
                    rulesSourceList: {
                        generatedRulesType: 'ALLOWLIST',
                        targets: listdomains,
                        targetTypes: ['TLS_SNI', 'HTTP_HOST'],
                    },
                },
            },
        });

        // Network Firewall Policy
        this.fw_policy = new fw.CfnFirewallPolicy(this, 'fw_policy', {
            firewallPolicyName: 'cdk-network-firewall-policy',
            firewallPolicy: {
                statelessDefaultActions: ['aws:drop'],
                statelessFragmentDefaultActions: ['aws:pass'],
                statefulRuleGroupReferences: [{
                    resourceArn: this.domainallowlist.ref,
                }],
            }
        })
        // Network Firewall endpoint (Gateway Load Balancer)
        this.firewall = new fw.CfnFirewall(this, 'network-firewall', {
            firewallName: 'cdk-network-firewall',
            firewallPolicyArn: this.fw_policy.attrFirewallPolicyArn,
            subnetMappings: subnetList,
            vpcId: vpcId,
            deleteProtection: false,
            description: 'AWS Network Firewall to centrally control egress traffic',
            firewallPolicyChangeProtection: false,
            subnetChangeProtection: true,
        });
    }
}
