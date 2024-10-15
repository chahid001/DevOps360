import * as gcp from "@pulumi/gcp";
import * as dotenv from "dotenv";

dotenv.config();


export function createSubnet(vpc: gcp.compute.Network, 
    name: string, range: string) {

    const subnet = new gcp.compute.Subnetwork(name, {

        region: process.env.REGION,
        network: vpc.id,
        ipCidrRange: range,
        privateIpGoogleAccess: true,
    });

    return subnet;
}  