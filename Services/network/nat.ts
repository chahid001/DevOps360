import * as gcp from "@pulumi/gcp";
import * as dotenv from "dotenv";

dotenv.config();

export function createNatGateway(vpc: gcp.compute.Network, 
    subnet: gcp.compute.Subnetwork) {

    const Router = new gcp.compute.Router("nat-router", {
        network: vpc.id,
        region: subnet.region,
        
        bgp: {
            asn: 65001,
        }
    });

    const NAT = new gcp.compute.RouterNat("nat", {
        router: Router.id,
        region: Router.region,
        natIpAllocateOption: "AUTO",
        sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    })

    return NAT;
}