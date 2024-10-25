import * as gcp from "@pulumi/gcp";
import { Firewall, Network } from "@pulumi/gcp/compute";
import { Connection } from "@pulumi/gcp/servicenetworking";
import { Database, DatabaseInstance, User } from "@pulumi/gcp/sql";
import * as dotenv from "dotenv";

dotenv.config();

export function createDataBase(service: string, srv_region: string, 
    vpc: Network, user: string | undefined, password: string | undefined, peer: Connection) {

    const instanceData = new DatabaseInstance(`${service}-db-instance`, {
        databaseVersion: "POSTGRES_13",
        deletionProtection: false,
        settings: {
            tier: "db-f1-micro",
            databaseFlags: [
                {
                    name: "max_locks_per_transaction",
                    value: "128",
                },
                { 
                    name: "max_connections", 
                    value: "200" 
                },
            ],
            backupConfiguration: {
                enabled: false,
            },
            ipConfiguration: {
                privateNetwork: vpc.id,
                ipv4Enabled: false,
            },
        },
        region: srv_region, 
    }, {
        dependsOn: [peer],
    });

    const dbUser = new User(`${service}-db-user`, {
        instance: instanceData.name,
        name: user,
        password: password,
    });

    new Database(`${service}-db`, {
        instance: instanceData.name,
        name: service,
    });

    new Firewall(`${service}-db-firewall`, {
        network: vpc.id,
        allows: [{
            protocol: "tcp",
            ports: ["5432"],
        }],
        sourceRanges: ["0.0.0.0/0"],  
        targetTags: [`${service}`],
    });
}
