 # 🌐 **DevOps360: Optimized GCP Cloud Infrastructure with Enhanced DevSecOps Practices and Automated CI/CD Pipeline**

## 🚀 **Overview**  

  DevOps360 establishes a cutting-edge cloud infrastructure on Google Cloud Platform (GCP) that integrates robust security and efficient resource management. By implementing OpenVPN for secure communications, and internal DNS server for reliable service resolution, the project ensures a secure and efficient networking environment. Kubernetes is utilized for container orchestration, with deployments managed through Helm to facilitate streamlined application updates. The Blue-Green deployment strategy not only guarantees zero downtime during application upgrades but also allows for swift rollback if issues arise. Key performance enhancements, including kernel and database tuning, optimize the system for high concurrency and responsiveness. The automated CI/CD pipeline powered by GitLab integrates security testing (SAST, DAST, SCA, and CIS) to maintain code quality and compliance throughout the development lifecycle.
  
---
## 🛠 **Key Components**  
  
1. **🔒 OpenVPN**  
2. **🌐 Internal DNS Server**  
3. **🔗 Nginx Proxy**: Facilitates access to services on port 80 instead of their default ports.  
4. **⚙️ Kernel Settings Optimization**  
5. **📊 Database Settings Tuning**  
6. **🎛️ Helm & Blue-Green Deployment**  
7. **🌩️ Pulumi GCP Deploy with TypeScript**  
  
## ⚙️ **Architecture Overview**  

1. **🔒 OpenVPN**: Internal traffic is secured with OpenVPN, deployed in a public subnet in the US-Central1 region (Zone C), enabling secure remote access for team members. This solution was chosen over CloudVPN due to the need for a road-warrior configuration (client-to-gateway), which is not supported by GCP.

2. **🌐 Internal DNS**: An internal DNS server using dnsmasq is hosted in a private subnet in the US-Central1 region (Zone B). This setup ensures fast and secure DNS resolution for internal services. Initially considered CloudDNS, it was not viable due to VPN connectivity issues.

3. **🌃 Global VPC and Subnet Architecture**:  
   - A global VPC houses four private subnets for various services, each with dedicated routers and NAT configurations for secure internet access:  
     - GitLab CE server located in Europe-Southwest1 (Zone A).  
     - GitLab runners (with Docker) in Europe-Southwest1 (Zone B).  
     - Nexus repository server in US-West1 (Zone A).  
     - SonarQube server in US-West1 (Zone B).  
   - Each subnet is connected to its respective router and NAT, utilizing the same BGP AS number for internal communication.

4. **🔄 Firewall Rules**: Firewalls are configured for SSH access to private servers from a bastion host in a public subnet in US-Central1 (Zone A). Additionally, inbound traffic rules allow access to Nexus, SonarQube, and GitLab via ports 80 and 443, with Nexus also supporting ports 9001 and 9002 for CI/CD tool and web app repositories, and allowing DNS Traffic to port 53 in both **TCP** and **UDP**.

5. **🗄️ PostgreSQL Database Management**:  
   - Two PostgreSQL databases (one for GitLab and one for SonarQube) are created within a reserved IP range for Google-managed services.  
   - Internal connectivity is facilitated through VPC peering, with no public IPs required, enhancing security.  
   - Configurations include increased `max_locks_per_transaction` to 128 and `max_connections` to 200 to accommodate high transaction volumes.

6. **📊 Kernel & Database Optimization**: Kernel settings are optimized for performance, particularly for services like SonarQube, which utilizes Elasticsearch. Each database has specific firewall rules allowing internal traffic on necessary ports (5432 for PostgreSQL) to ensure smooth communication between services.

7. **🎛️ Kubernetes**: Managed Kubernetes deployments are handled via Helm, allowing efficient container orchestration and management of workloads. The infrastructure supports Blue-Green deployment strategies to ensure high availability during application updates, allowing seamless transitions between environments without downtime.

  
![Architecture Diagram](https://github.com/chahid001/DevOps360/blob/main/assets/archi.png)  
  
## 📈 **Technical Considerations**  

1. **🔒 OpenVPN vs CloudVPN**: The type of VPN I needed (Road-Warrior, or client-to-gateway) isn't implemented in GCP. Therefore, I opted for **OpenVPN** to fulfill the requirement of secure client-to-gateway communication.  
2. **🌐 Internal DNS vs CloudDNS**: I initially considered **CloudDNS**, but it didn't work with my laptop when connected through VPN, as it falls outside the GCP environment. I chose an **Internal DNS server** instead to maintain reliable DNS resolution for internal services. 
3. **⚙️ Kernel & DB Optimization**:  
   - **Kernel Settings**: I modified kernel settings by increasing `vm.max_map_count` to 524,288 (from the default 65,530). This was necessary because **SonarQube** uses **Elasticsearch**, which requires a large number of memory-mapped files to index and search data efficiently.  
   - **📂 File Descriptors**: I increased the number of file descriptors that can be opened by all processes on the system, as both **SonarQube** and **Elasticsearch** handle a large number of files simultaneously.  
   - **🔒 Security Limits**: I added configurations in `/etc/security/limits.d/` to raise limits for the **SonarQube** user, increasing both the number of file descriptors (`nofile`) and the number of processes (`noproc`) they can create.  
   - **🛠️ SonarQube Service**: After making these changes, I created a system service to manage **SonarQube** efficiently.  
4. **🔄 Blue-Green Deployment**: Chosen for zero-downtime updates, ensuring continuous availability during upgrades.  
5. **🚀 GitLab CICD**: Fully automated pipelines for testing, building, and deploying the application using Helm.  
6. **🔐 HTTPS and Certificates**: Since I used self-signed certificates, I commented out most of the HTTPS-related configuration because **GitLab** and the **GitLab runners** couldn’t trust the self-signed certificate (not being signed by a CA).  

## 🔑 **Resources I Used**  
- [OWASP Dependency Check Dockerfile](https://hub.docker.com/r/owasp/dependency-check/dockerfile)  
- [Nexus Main Port problem: Thanks Rich](https://groups.google.com/a/glists.sonatype.com/g/nexus-users/c/RWAK0BDSowU?pli=1)  
- [Using Sonatype Nexus Repository 3 for Docker Images](https://www.sonatype.com/blog/using-sonatype-nexus-repository-3-part-3-docker-images)  
- [Blue/Green Kubernetes deployments using Helm and CI/CD](https://www.youtube.com/watch?v=er0JTGnryZ4)  
- [GitLab CI/CD to Deploy Applications on GKE](https://medium.com/@jaydeepawar4912/gitlab-ci-cd-to-deploy-applications-on-gke-806658160534)  
- [What is HELM ?](https://www.youtube.com/watch?v=-ykwb1d0DXU)  
- [Installing Helm in Google Kubernetes Engine](https://medium.com/google-cloud/installing-helm-in-google-kubernetes-engine-7f07f43c536e)  
  
## 📝 **Workflow & Branching**  

![Workflow Diagram](https://github.com/chahid001/DevOps360/blob/main/assets/workflow.png)
### CI/CD Workflow and Branch Strategy

1. **🌱 Develop Branch**:  
   - Active development occurs here.  
   - Features and updates are developed and tested in this branch before merging into the `main` branch.  
   - Continuous Integration (CI) automatically builds and tests code on every commit.

2. **📦 Staging Branch**:  
   - Used for deploying the new version to a **staging environment** in **Google Kubernetes Engine (GKE)**.  
   - A **blue-green deployment** strategy is applied, where the new version is deployed to a free environment (either blue or green).  
   - Teams (QA testers or developers) access the staging environment via a temporary **service** or **port-forwarding** for testing purposes.

3. **🚀 Main Branch (Master)**:  
   - Contains **production-ready code**.  
   - Once the new version in staging is verified, the **Helm chart** switches the service to point to the appropriate environment (either blue or green), ensuring a **seamless transition** without downtime.

4. **🔄 GitLab CI Pipeline**:  
   - Automates the process of scanning, building, and testing the application on every push.  
   - If all tests pass, the CI pipeline triggers a **Helm deployment** using the **Blue-Green deployment** strategy, deploying the new version to GKE.  
   - Ensures that changes are gradually rolled out and tested before becoming live in production.

🎯 **Goals Achieved**  
- 🛠️ Fully automated infrastructure with secure networking through OpenVPN, internal DNS, and a proxy server.
- ⚙️ Enhanced system performance with kernel tuning for Elasticsearch and database optimizations for high concurrency.
- 📈 Scalable, zero-downtime deployments via Helm and Blue-Green strategy, ensuring seamless production updates.
- 🔄 Continuous Integration and Delivery (CI/CD) with GitLab pipelines, enabling efficient development cycles with automated security and testing tools (SAST, DAST, SCA, and CIS).

## 📦 **Deployment Steps**  
  
1. Clone the repository.  
2. In devops-services directory, add appropriate Variables to .env(Check types/end.d.ts) and deploy GCP infra:

```bash  
pulumi up  
```  

3. Check Ansible and add appropriate values to Inventories/host.ini & defaults/main.yml in all Roles.

```bash  
ansible-playbook playbook.yml -i Inventories/hosts.ini --private-key PRIVATE_KEY
```  

4. SSH to VPN server, and past the following commands:

```bash  
sudo apt update
curl -O https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh
chmod +x openvpn-install.sh
sudo ./openvpn-install.sh
```  
**NB.: JUST KEEP STUCK WITH DEFAULT SETTING. FOR DNS, CHOOSE CUSTOM (13) AND ADD DNS INTERNAL SERVER IP**

5. **Nexus Setup**  
   - Logged into **Nexus** with the provided admin credentials.  
   - Created a **role** for `devops-cicd` with appropriate policies.  
   - Created a **DevOps Engineer** user and assigned them the `devops-cicd` role.  
   - On the **GitLab Runner** server, added Nexus registry to the **Docker daemon config** to allow insecure connections to **ports 9001** and **9002** for pushing images. 
   Update `/etc/docker/daemon.json` as follows:
   ```jsx
   {
     "insecure-registries": [
       "nexus.devops360.org:9001",
       "nexus.devops360.org:9002"
     ]
   }
   ```  
   Then run:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart docker
   ```     

6. **Security Group Setup**  
   - Planned to create **2 groups** in Nexus:  
     - Group 1: **CI/CD Tools** - Docker proxy to Docker Hub and a hosted Docker repository.  
     - Group 2: **App/Web/Mobile** - Separate Docker repositories for different services.  
   - Due to needing a paid version, used two separate repositories instead:  
     - `9002` for apps,  
     - `9001` for CI/CD tools.  
   - For security, images were **pulled from Docker Hub**, tagged, and then pushed to the Nexus repositories.  
   
   The tools organized into 4 categories:  
   - **SAST**: SonarQube Scanner  
   - **DAST**: OWASP ZAP, OWASP Dependency Check  
   - **SCA**: Gitleaks, Trivy Scanner  
   - **CIS**: Trivy
   - **Google SDK (GCP)**: Custom GCP image with Helm installed
   
   Custom **GCP image** Dockerfile example:
   ```docker
   FROM google/cloud-sdk:latest
   # Install necessary packages
   RUN apt-get update && apt-get install -y curl && apt-get clean && rm -rf /var/lib/apt/lists/*
   # Install Helm
   RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

7. **Runner Setup**  
   - Deployed two types of **GitLab Runners**:  
     - **Docker Executor**: For containers, using `docker-in-docker` (dind).  
     - **Shell Executor**: For executing shell scripts.  
   - Used a custom image based on `gitlab/gitlab-runner:latest` with Docker installed.
   ```docker
   FROM gitlab/gitlab-runner:latest
   RUN apt-get update && apt-get install -y docker.io
   ``` 

   Docker Runner setup:
   ```bash
   sudo docker run -d --name docker_runner --restart always \
   -v /opt/gitlab-runner:/etc/gitlab-runner \
   -v /var/run/docker.sock:/var/run/docker.sock:ro \
   -v /etc/docker/daemon.json:/etc/docker/daemon.json:ro \
   gitlab-runner-dood:latest

   sudo docker exec docker_runner gitlab-runner register \
   --non-interactive \
   --url "http://gitlab.devops360.org" \
   --registration-token "au2dPtQYCiUqx1QQp9x7" \
   --executor "docker" \
   --description "Runner for docker" \
   --tag-list "docker_runner" \
   --docker-image debian:latest
   ```

   Shell Runner setup:
   ```bash
   sudo docker run -d --name shell_runner --restart always \
   -v /opt/gitlab-runner:/etc/gitlab-runner \
   -v /var/run/docker.sock:/var/run/docker.sock:ro \
   -v /etc/docker/daemon.json:/etc/docker/daemon.json:ro \
   gitlab-runner-dood:latest

   sudo docker exec shell_runner gitlab-runner register \
   --non-interactive \
   --url "http://gitlab.devops360.org" \
   --registration-token "au2dPtQYCiUqx1QQp9x7" \
   --executor "shell" \
   --description "Runner for shell" \
   --tag-list "shell_runner"
   ```

   After registering both runners, they were ready for **continuous integration**.

8. **Cluster Setup & Deployment**  
   - Deployed a **private Kubernetes cluster** with autoscaling using GCP GKE.  
   - Set up an **NGINX instance** with a public IP as a **proxy server** for routing traffic to the cluster.  
 
9. **CI/CD Pipeline & Blue-Green Deployment**  
   - Created a pipeline for **DevSecOps practices** in GitLab, automating **SAST**, **DAST**, **SCA**, and **CIS** scans using the tools configured in Nexus.  
   - Implemented a **Blue-Green deployment strategy** to ensure zero-downtime during updates, by deploying new versions alongside the current version, testing, and then switching traffic to the new version once it's verified.
  
🔚 **Conclusion**  
In summary, DevOps360 exemplifies the power of modern cloud infrastructure and DevSecOps practices, significantly improving operational efficiency and security posture. The project's automation and optimization strategies lead to faster development cycles, reduced downtime, and enhanced user satisfaction. By leveraging cutting-edge technologies and methodologies, this project sets a benchmark for scalable and resilient cloud solutions in today's fast-paced digital landscape.
