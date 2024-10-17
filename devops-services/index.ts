import { createVPC } from './network/vpc';
import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'
import { createBastion } from './bastion/bastion'
import {createFireWall} from './security/firewall'
import { Firewall, Instance, Subnetwork } from "@pulumi/gcp/compute";


// Global VPC
const vpc = createVPC("vpc-global-devops");
//Create Jump Server
createBastion(vpc);


const services = [
    { name: "gitlab", region: "europe-southwest1", subnetCIDR: "10.0.1.0/24", ports: ["80", "443"] },
    { name: "runner", region: "europe-southwest1", subnetCIDR: "10.0.2.0/24", ports: []},
    { name: "nexus", region: "us-west1", subnetCIDR: "10.0.3.0/24", ports: ["8080"] },
    { name: "sonarqube", region: "us-central1", subnetCIDR: "10.0.4.0/24", ports: ["9000"] },
]

services.forEach(service => {

    const subnet = createSubnet(vpc, `${service.name}-subnet`, service.region, service.subnetCIDR);

    createNatGateway(service.name, subnet);

    if (service.name != "runner") {
        createFireWall(service.name, vpc, service.ports);
    }

    new Firewall(`allow-${service.name}`, {
        network: vpc.id,
        
        allows: [
            {
                protocol: "tcp",
                ports: ["22"],
            }
        ],

        sourceRanges: ["172.32.1.0/24"],
        targetTags: [`${service.name}`],
    });

    createVM(subnet, service.name, `${service.region}-a`);

});

// const subnet = createSubnet(vpc, "subnet-test", "10.0.1.0/24");
// createNatGateway(subnet);
// createVM(subnet, "vm-test");