import * as gcp from "@pulumi/gcp";
import { createVPC } from './network/vpc';
import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'
import { createBastion } from './bastion/bastion'
import {createFireWall} from './security/firewall'
import { createDataBase } from './data/database'
import { createDNS } from './DNS/internalDNS'
import { createVPN } from './VPN/openVpn'
import { peerVPC } from './data/vpc-peering'
import { Firewall, Subnetwork } from "@pulumi/gcp/compute";
import * as dotenv from "dotenv";

dotenv.config();


// Global VPC
const vpc = createVPC("vpc-global-devops");
//Create Jump Server
createBastion(vpc);
const peer = peerVPC(vpc);
const DNSIP = createDNS(vpc);

const services = [
    { 
        name: "gitlab", 
        region: "europe-southwest1", 
        subnetCIDR: "10.0.1.0/24",
        zone: "europe-southwest1-a",
        machine: "e2-highcpu-4",
        ports: ["80", "443"] 
    },
    { 
        name: "runner", 
        region: "europe-southwest1",
        zone: "europe-southwest1-b", 
        subnetCIDR: "10.0.2.0/24",
        machine: "e2-medium", 
        ports: []
    },
    { 
        name: "nexus", 
        region: "us-west1",
        zone: "us-west1-a", 
        subnetCIDR: "10.0.3.0/24",
        machine: "e2-medium", 
        ports: ["80", "443"] 

    },
    { 
        name: "sonarqube", 
        region: "us-west1",
        zone: "us-west1-b", 
        subnetCIDR: "10.0.4.0/24",
        machine: "e2-standard-2", 
        ports: ["80", "443"] 
    },
]

const subnets_eu: Subnetwork[] = [];
const subnets_us: Subnetwork[] = [];

services.forEach(service => {

    const subnet = createSubnet(vpc, `${service.name}-subnet`, service.region, service.subnetCIDR);

    if (service.region == "europe-southwest1") {
        subnets_eu.push(subnet);
    }
    
    if (service.region == "us-west1") {
        subnets_us.push(subnet);
    }

    if (service.name != "runner") {
        createFireWall(service.name, vpc, service.ports);
    }

    if (service.name === "gitlab") {
        createDataBase(service.name, service.region, vpc, process.env.GITLAB_DB_USER, process.env.GITLAB_DB_PASSWORD, peer);
    }

    if (service.name === "sonarqube") {
        createDataBase(service.name, service.region, vpc, process.env.SONAR_DB_USER, process.env.SONAR_DB_PASSWORD, peer);
    }

    new Firewall(`allow-${service.name}`, {
        network: vpc.id,
        
        allows: [
            {
                protocol: "tcp",
                ports: ["22"],
            },
        ],

        sourceRanges: ["172.32.1.0/24"],
        targetTags: [`${service.name}`],
    });

    const VM = createVM(subnet, service.name, service.zone, service.machine, "172.30.1.14");
});

createNatGateway("eu", subnets_eu);
createNatGateway("us", subnets_us);

createVPN(vpc);
