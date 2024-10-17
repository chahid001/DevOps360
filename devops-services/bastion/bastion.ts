import * as gcp from "@pulumi/gcp";
import { Firewall, Instance, Network, Subnetwork } from "@pulumi/gcp/compute";
import * as dotenv from "dotenv";

dotenv.config();

export function createBastion(vpc: Network) {

    const subnet = new Subnetwork("subnet-bastion", {

        network: vpc.id,
        region: "us-central1",
        ipCidrRange: "172.32.1.0/24",
        privateIpGoogleAccess: true,
    });

    new Firewall("bastion-firewall", {
        network: subnet.network,
        allows: [
            {
                protocol: "tcp",
                ports: ["22"]
            }
        ],

        sourceRanges: ["0.0.0.0/0"],
        targetTags: ["bastion"],
    });

    new Instance("bastion-host", {
        machineType: "e2-medium",
        zone: "us-central1-a",
        bootDisk: {
            initializeParams: {
                image: "ubuntu-os-cloud/ubuntu-2204-lts",
                size: 10,
            },
        },

        networkInterfaces: [{   
            network: subnet.network,
            subnetwork: subnet.id,
            networkIp: "172.32.1.13",
            accessConfigs: [{

            }]
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        tags: ["bastion"]
    });
}