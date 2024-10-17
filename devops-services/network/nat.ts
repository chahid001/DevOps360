import * as gcp from "@pulumi/gcp";
import { Router, RouterNat, Subnetwork } from "@pulumi/gcp/compute";


export function createNatGateway(name: string, subnet: Subnetwork) {

    const NAT_Router = new Router(`${name}-router`, {
        network: subnet.network,
        region: subnet.region,
        
        bgp: {
            asn: 65001,
        }
    });

    const NAT = new RouterNat(`${name}-nat`, {
        router: NAT_Router.name,
        region: NAT_Router.region,
        natIpAllocateOption: "AUTO_ONLY",
        sourceSubnetworkIpRangesToNat: "ALL_SUBNETWORKS_ALL_IP_RANGES",
    })

    return NAT;
}