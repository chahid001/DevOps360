import { createVPC } from './network/vpc';
import { createSubnet } from './network/subnet';
import { createNatGateway } from './network/nat'
import { createVM } from './vm/machine'
import { createBastion } from './bastion/bastion'
import {createFireWall} from './security/firewall'
import { createDataBase } from './data/database'
import { Firewall, Instance, Subnetwork } from "@pulumi/gcp/compute";
import * as dotenv from "dotenv";

dotenv.config();


// Global VPC
const vpc = createVPC("vpc-global-devops");
//Create Jump Server
createBastion(vpc);


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
        ports: ["8081"] 

    },
    { 
        name: "sonarqube", 
        region: "us-west1",
        zone: "us-west1-b", 
        subnetCIDR: "10.0.4.0/24",
        machine: "e2-standard-2", 
        ports: ["9000"] 
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

    createVM(subnet, service.name, service.zone, service.machine);
});

createNatGateway("eu", subnets_eu);
createNatGateway("us", subnets_us);

createDataBase(services[0].name, vpc, process.env.SONAR_DB_USER, process.env.SONAR_DB_PASSWORD);
createDataBase(services[3].name, vpc, process.env.GITLAB_DB_USER, process.env.GITLAB_DB_PASSWORD);
