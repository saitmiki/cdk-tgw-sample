import * as cdk from 'aws-cdk-lib';
import { CdkNetowrkStack } from '../lib/cdk-vpc'
import { CdkTgwStack } from '../lib/cdk-tgw';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

const configFile = readFileSync("./config/stage.yml", "utf8")
const config = parse(configFile)

const app = new cdk.App()
// Creating VPC
new CdkNetowrkStack(app, "CdkNetowrkStack", {
    vpc_cidr: config.vpc.vpc_cidr
})
// Creating TGW
new CdkTgwStack(app, "CdkTgwStack")