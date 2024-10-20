import * as gcp from "@pulumi/gcp";
import { Network } from "@pulumi/gcp/compute";
import * as dotenv from "dotenv";

dotenv.config();

export function peerVPC(vpc: Network) {
    
    const googleServicesIp = new gcp.compute.GlobalAddress("db-services-ip", {
        addressType: "INTERNAL",
        prefixLength: 16,
        purpose: "VPC_PEERING",
        network: vpc.id,
    });
    
    const privatevpc = new gcp.servicenetworking.Connection("db-vpc-peering", {
        network: vpc.id,
        service: "servicenetworking.googleapis.com",
        reservedPeeringRanges: [googleServicesIp.name],
    }, {
        dependsOn: [googleServicesIp],
    });

    return privatevpc;
}

