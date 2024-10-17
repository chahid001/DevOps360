import * as gcp from "@pulumi/gcp";
import { Router, RouterNat, Subnetwork } from "@pulumi/gcp/compute";


export function createNatGateway(name: string, subnets: Subnetwork[]) {

    const NAT_Router = new Router(`${name}-services-router`, {
        network: subnets[0].network,
        region: subnets[0].region,
        
        bgp: {
            asn: 65001,
        }
    });

    const NAT = new RouterNat(`${name}-services-nat`, {
        router: NAT_Router.name,
        region: NAT_Router.region,
        natIpAllocateOption: "AUTO_ONLY",
        sourceSubnetworkIpRangesToNat: "LIST_OF_SUBNETWORKS",
        subnetworks: subnets.map( subnet => ({
            name: subnet.id,
            sourceIpRangesToNats: ["ALL_IP_RANGES"],
        })),
    });

    return NAT;
}