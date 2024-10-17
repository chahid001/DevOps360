import * as gcp from "@pulumi/gcp";
import * as dotenv from "dotenv";

dotenv.config();

export function createNatGateway(subnet: gcp.compute.Subnetwork) {

    const Router = new gcp.compute.Router("nat-router", {
        network: subnet.network,
        region: subnet.region,
        
        bgp: {
            asn: 65001,
        }
    });

    const NAT = new gcp.compute.RouterNat("nat", {
        router: Router.name,
        region: Router.region,
        natIpAllocateOption: "AUTO_ONLY",
        sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    })

    new gcp.compute.Firewall("allow-ssh", {
        network: subnet.network,

        allows: [
            {
                ports: ["22"],
                protocol: "tcp"

            }
        ],

        sourceRanges: ["172.32.1.0/24"],
        targetTags: ["ssh-allowed"]

    }); 

    new gcp.compute.Firewall("allow-http", {
        network: subnet.network,

        allows: [
            {
                ports: ["80", "443"],
                protocol: "tcp"

            }
        ],

        sourceRanges: ["0.0.0.0/0"],
        targetTags: ["ssh-allowed"]

    }); 

    return NAT;
}