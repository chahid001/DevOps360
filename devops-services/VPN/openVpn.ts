import * as gcp from "@pulumi/gcp";
import { Firewall, Network, Subnetwork, Instance } from "@pulumi/gcp/compute";

export function createVPN(vpc: Network) {
    
    const subnet = new Subnetwork("openvpn-subnet", {
        network: vpc.id,
        region: "us-central1",
        ipCidrRange: "172.31.1.0/24",
        privateIpGoogleAccess: true,
    });

    new Firewall("openvpn-firewall", {
        network: subnet.network,
        allows: [
            {
                protocol: "udp",
                ports: ["1194"],
            },

            {
                protocol: "tcp",
                ports: ["22"]
            }
        ],

        sourceRanges: ["0.0.0.0/0"],
        targetTags: ["openvpn"],
    });

    new Instance("openvpn-server", {

        name: "openvpn-server",
        machineType: "e2-medium",
        zone: "us-central1-c",
        bootDisk: {
            initializeParams: {
                image: "ubuntu-os-cloud/ubuntu-2204-lts",
                size: 10,
            },
        },

        networkInterfaces: [{   
            network: subnet.network,
            subnetwork: subnet.id,
            networkIp: "172.31.1.14",
            accessConfigs: [{
                // Public
            }]
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        tags: ["openvpn"]
    });

    new Firewall("allow-internal-trrfaic", {

        network: vpc.id,
        allows: [
            {
                protocol: "tcp",
                ports: ["80", "443"],
            }
        ],
        sourceRanges: ["10.0.0.0/16", "172.31.1.0/24"],
    });
}