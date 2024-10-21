import * as gcp from "@pulumi/gcp";
import { Firewall, Network } from "@pulumi/gcp/compute";


export function createFireWall(target: string, vpc: Network, ports: string[]) {

    new Firewall(`${target}-firewall`, {

        network: vpc.id,

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