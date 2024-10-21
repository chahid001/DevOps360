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
            networkIp: "172.30.1.14",
            accessConfigs: []
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        // metadataStartupScript: `
        //     #!/bin/bash

        //     # Install dnsmasq
        //     sudo apt-get update
        //     sudo apt-get install -y dnsmasq

        //     # Stop and disable systemd-resolved
        //     sudo systemctl stop systemd-resolved
        //     sudo systemctl disable systemd-resolved
            
        //     # Backup existing dnsmasq config
        //     sudo cp /etc/dnsmasq.conf /etc/dnsmasq.conf.backup

        //     # Configure dnsmasq for internal DNS records
        //     sudo bash -c 'cat <<EOL > /etc/dnsmasq.conf
        //         # Listen on the VPC interface
        //         interface=ens4

        //         # Set your domain
        //         domain-needed
        //         bogus-priv

        //         # Define internal DNS records
        //         address=/gitlab.devops.360/10.0.2.1  # GitLab VM IP
        //         address=/sonarqube.devops.360/10.0.3.2  # Nexus VM IP
        //         address=/nexus.devops.360/10.0.4.2  # SonarQube VM IP

        //         # Optional: forward all other requests to an external DNS server
        //         server=8.8.8.8
        //     EOL'

        //     # Restart dnsmasq to apply the changes
        //     sudo systemctl restart dnsmasq
        //     sudo systemctl enable dnsmasq
        // `,

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