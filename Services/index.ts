import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { createVPC } from './network/vpc';
import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'


const vpc = createVPC("vpc-test");
const subnet = createSubnet(vpc, "subnet-test", "10.0.1.0/24");
createNatGateway(vpc, subnet);
createVM(subnet, "vm-test");