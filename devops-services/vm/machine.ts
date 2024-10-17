import * as gcp from "@pulumi/gcp";
import { Subnetwork } from "@pulumi/gcp/compute";
import * as dotenv from "dotenv";

dotenv.config();


export function createVM(subnet: Subnetwork, vmName: string, zone: string) {

    const VM = new gcp.compute.Instance(vmName, {
        
        name: vmName,
        machineType: "e2-medium",
        zone: zone,
        bootDisk: {
            initializeParams: {
                image: "ubuntu-os-cloud/ubuntu-2204-lts",
                size: 15,
            },
        },

        networkInterfaces: [{   
            network: subnet.network,
            subnetwork: subnet.id,
            accessConfigs: []
        }],

        metadata: {
            "ssh-keys": `${process.env.USER_VM}:${process.env.PUBLIC_KEY}`,
        },

        tags: [`${vmName}`]
    });

    return VM;

}