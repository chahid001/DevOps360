import * as gcp from "@pulumi/gcp";
import { Instance, Network } from "@pulumi/gcp/compute";
import { ManagedZone, RecordSet } from "@pulumi/gcp/dns";
import * as dotenv from "dotenv";

dotenv.config();



export function createDNS(vpc: Network) {

    const dnsZone = new ManagedZone("private-zone", {
        dnsName: "devops.360.",
        visibility: "private",
        privateVisibilityConfig: {
            networks: [{
                networkUrl: vpc.id,
            }]
        }
    })

    return dnsZone;
}

export function setDNS(service: string, dnsZone: ManagedZone, Instance: Instance) {
    
    new RecordSet(`${service}-dns`, {
        managedZone: dnsZone.name,
        name: `${service}.devops.360.`,
        type: "A",
        ttl: 300,
        rrdatas: [Instance.networkInterfaces[0].networkIp]
    }, {
        dependsOn: [dnsZone, Instance],
    });
}