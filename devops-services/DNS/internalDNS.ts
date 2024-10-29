import * as gcp from "@pulumi/gcp";
import { Firewall, Network, Subnetwork, Instance, Router, RouterNat } from "@pulumi/gcp/compute";

export function createDNS(vpc: Network) {
    
    const subnet = new Subnetwork("dns-subnet", {
        network: vpc.id,
        region: "us-central1",
        ipCidrRange: "172.30.1.0/24",
        privateIpGoogleAccess: true,
    });

    new Firewall("dns-firewall", {
        network: subnet.network,
        allows: [
            {
                protocol: "tcp",
                ports: ["22"]
            }, 
        ],

        sourceRanges: ["0.0.0.0/0"],
        targetTags: ["dns"],
    });

    const server = new Instance("dns-server", {

        name: "dns-server",
        machineType: "e2-micro",
        zone: "us-central1-b",
        bootDisk: {
            initializeParams: {
                image: "ubuntu-os-cloud/ubuntu-2204-lts",
                size: 10,
            },
        },

        networkInterfaces: [{   
            network: subnet.network,
            subnetwork: subnet.id,
            networkIp: "172.30.1.14",
            accessConfigs: []
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        tags: ["dns"]
    });

    const NAT_Router = new Router("dns-route", {
        network: subnet.network,
        region: subnet.region,
        
        bgp: {
            asn: 65001,
        }
    });

    const NAT = new RouterNat("dns-server-nat", {
        router: NAT_Router.name,
        region: NAT_Router.region,
        natIpAllocateOption: "AUTO_ONLY",
        sourceSubnetworkIpRangesToNat: "LIST_OF_SUBNETWORKS",
        subnetworks: [
            {
                name: subnet.id,
                sourceIpRangesToNats: ["ALL_IP_RANGES"],
            }
        ]
    });

    new Firewall("allow-dns-traffic", {
        network: vpc.id,
        allows: [
            {
                protocol: "tcp",
                ports: ["53"],
            },
            {
                protocol: "udp",
                ports: ["53"],
            }
        ],
        sourceRanges: ["10.0.0.0/16", "172.31.1.0/24"],
    });

    return server.networkInterfaces[0].networkIp
}