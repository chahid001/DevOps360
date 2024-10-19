import * as gcp from "@pulumi/gcp";
import { Firewall, Network } from "@pulumi/gcp/compute";
import { Database, DatabaseInstance, User } from "@pulumi/gcp/sql";
import * as dotenv from "dotenv";

dotenv.config();

export function createDataBaseSonar(vpc: Network) {

    const googleServicesIp = new gcp.compute.GlobalAddress("google-services-ip", {
        addressType: "INTERNAL",
        prefixLength: 24, 
        purpose: "VPC_PEERING",
        network: vpc.id,
        address: "10.0.5.0" 
    });

    const privatevpc = new gcp.servicenetworking.Connection("vpc-peering", {
        network: vpc.id,
        service: "servicenetworking.googleapis.com",
        reservedPeeringRanges: [googleServicesIp.name],
    });

    const Instance_data = new DatabaseInstance("sonar-db-instance", {
        databaseVersion: "POSTGRES_13",
        deletionProtection: false,
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

    const dbUser = new User("db-user", {
        instance: Instance_data.name,
        name: "sonaruser",  
        password: "sonarpassword", 
    });

    new Database("database-sonar", {
        instance: Instance_data.name,
        name: "sonarqube"
    });

    new Firewall("sonar-db-sec", {
        network: vpc.id,
        allows: [{
            protocol: "tcp",
            ports: ["5432"], 
        }],
        sourceRanges: ["0.0.0.0/0"],  
        targetTags: ["sonarqube"],    
    });
}

