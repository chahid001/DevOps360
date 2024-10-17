import { createVPC } from './network/vpc';
// import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'
import { createBastion } from './bastion/bastion'
import { Firewall, Instance, Subnetwork } from "@pulumi/gcp/compute";


// Global VPC
const vpc = createVPC("vpc-global-devops");
//Create Jump Server
createBastion(vpc);


const services = [
    { name: "gitlab", region: "europe-southwest1", subnetCIDR: "10.0.1.0/24" },
    { name: "runner", region: "europe-southwest1", subnetCIDR: "10.0.2.0/24" },
    { name: "nexus", region: "us-west1", subnetCIDR: "10.0.3.0/24" },
    { name: "sonarqube", region: "us-central1", subnetCIDR: "10.0.4.0/24" },
]

services.forEach(service => {

    const subnet = new Subnetwork(`${service.name}-subnet`, {
        network: vpc.id,
        region: service.region,
        ipCidrRange: service.subnetCIDR,
        privateIpGoogleAccess: true,
    });

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

    new Instance(`${service.name}-vm`, {

        machineType: "e2-medium",
        zone: `${service.region}-a`,
        
        bootDisk: {
            initializeParams: {
                image: "ubuntu-os-cloud/ubuntu-2204-lts",
                size: 20,
            },
        },

        networkInterfaces: [{
            network: subnet.network,
            subnetwork: subnet.id,
            accessConfigs: []
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        tags: [`${service.name}`]

    });

});

// const subnet = createSubnet(vpc, "subnet-test", "10.0.1.0/24");
// createNatGateway(subnet);
// createVM(subnet, "vm-test");