import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { createVPC } from './network/vpc';
// import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'
import { createBastion } from './bastion/bastion'
import { Subnetwork } from "@pulumi/gcp/compute";


// Global VPC
const vpc = createVPC("vpc-global-devops");
//Create Jump Server
createBastion(vpc);


const services = [
    { name: "gitlab", region: "europe-west1", subnetCIDR: "10.0.1.0/24" },
    { name: "runner", region: "europe-west1", subnetCIDR: "10.0.2.0/24" },
    { name: "nexus", region: "us-west1", subnetCIDR: "10.0.3.0/24" },
    { name: "SonarQube", region: "us-central1", subnetCIDR: "10.0.4.0/24" },
]

services.forEach(service => {

    const subnet = new Subnetwork(`${service.name}-subnet`, {
        network: vpc.id,
        region: service.region,
        ipCidrRange: service.subnetCIDR,
        privateIpGoogleAccess: true,
    });

});

// const subnet = createSubnet(vpc, "subnet-test", "10.0.1.0/24");
// createNatGateway(subnet);
// createVM(subnet, "vm-test");