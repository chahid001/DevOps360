import * as gcp from "@pulumi/gcp";

export function createVPC(name: string) {
    
    const vpc = new gcp.compute.Network(name, {
        autoCreateSubnetworks: false,
    })

    return vpc;
}

