import * as gcp from "@pulumi/gcp";
import { Firewall, Network } from "@pulumi/gcp/compute";
import { Database, DatabaseInstance, User } from "@pulumi/gcp/sql";
import * as dotenv from "dotenv";
import path = require("path");

dotenv.config();

export function createDataBase(service: string, vpc: Network, 
    user: string, password: string) {

    const googleServicesIp = new gcp.compute.GlobalAddress(`${service}-services-ip`, {
        addressType: "INTERNAL",
        prefixLength: 24, 
        purpose: "VPC_PEERING",
        network: vpc.id,
    });

    const privatevpc = new gcp.servicenetworking.Connection(`${service}vpc-peering`, {
        network: vpc.id,
        service: "servicenetworking.googleapis.com",
        reservedPeeringRanges: [googleServicesIp.name],
    });

    const Instance_data = new DatabaseInstance(`${service}-db-instance`, {
        databaseVersion: "POSTGRES_13",
        deletionProtection: false,
        name: `${service}-DB`,
        settings: {
            tier: "db-f1-micro",
            backupConfiguration: {
                enabled: false,
            },
            ipConfiguration: {
                privateNetwork: vpc.id,  
                ipv4Enabled: false,      
            }
        },
        region: "us-central1", 
    }, {
        dependsOn: [privatevpc],
    });

    const dbUser = new User(`${service}-db-user`, {
        instance: Instance_data.name,
        name: user,  
        password: password, 
    });

    new Database("database-sonar", {
        instance: Instance_data.name,
        name: service,
    });

    new Firewall("sonar-db-sec", {
        network: vpc.id,
        allows: [{
            protocol: "tcp",
            ports: ["5432"], 
        }],
        sourceRanges: ["0.0.0.0/0"],  
        targetTags: [`${service}`],    
    });
}

