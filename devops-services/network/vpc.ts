import * as gcp from "@pulumi/gcp";
import { Network } from "@pulumi/gcp/compute";

export function createVPC(name: string) {
    
    const vpc = new Network(name, {
        autoCreateSubnetworks: false,
    })

    return vpc;
}

