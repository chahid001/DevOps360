import * as gcp from "@pulumi/gcp";

// export function createSubnet(vpc: gcp.compute.Network, 
//     name: string, range: string) {

//     const subnet = new gcp.compute.Subnetwork(name, {

//         region: "us-central1",
//         network: vpc.id,
//         ipCidrRange: range,
//         privateIpGoogleAccess: true,
//     });

//     return subnet;
// }  