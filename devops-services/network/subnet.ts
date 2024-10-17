import * as gcp from "@pulumi/gcp";
import { Network, Subnetwork } from "@pulumi/gcp/compute";

export function createSubnet(vpc: Network, name: string, 
    region: string, range: string) {

    const subnet = new Subnetwork(name, {

        region: region,
        network: vpc.id,
        ipCidrRange: range,
        privateIpGoogleAccess: true,
    });

    return subnet;
}  