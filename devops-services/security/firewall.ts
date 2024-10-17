import * as gcp from "@pulumi/gcp";
import { Firewall } from "@pulumi/gcp/compute";


export function createFireWall(target: string, network: string, ports: string[]) {

    new Firewall(`${target}-firewall`, {

        network: network,

        allows: [
            {
                protocol: "tcp",
                ports: ports,
            }
        ],

        sourceRanges: ["0.0.0.0/0"],
        targetTags: [`${target}`],
        
    });

}