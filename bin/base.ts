import * as cdk from 'aws-cdk-lib';
import { CdkNetowrkStack } from '../lib/cdk-vpc'
import { CdkTgwStack } from '../lib/cdk-tgw';
import { CdkNetowrkFirewallStack } from '../lib/cdk-networkfirewall';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

const configFile = readFileSync("./config/stage.yml", "utf8")
const config = parse(configFile)

const app = new cdk.App()
// Creating VPC
new CdkNetowrkStack(app, "CdkNetowrkStack", {
    vpc_cidr: config.vpc.vpc_cidr,
    networkFirewall_vpc_cidr: config.vpc.networkFirewall_vpc_cidr
})
// Creating TGW
new CdkTgwStack(app, "CdkTgwStack",
    { env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION } })

// Creating TGW
new CdkNetowrkFirewallStack(app, "CdkNetworkFirewallStack",
    { env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION } })