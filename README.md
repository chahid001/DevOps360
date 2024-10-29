# 🌐 **DevOps360: Comprehensive GCP Cloud Infrastructure Setup with DevSecOps practices, Gitlab CICD pipeline, workflow, Helm & Blue-Green Deployment**  
  
🚀 **Overview**  
This project implements a robust infrastructure with OpenVPN, an internal DNS server, a proxy server, and Kubernetes deployments managed via Helm. We leverage a Blue-Green deployment strategy for seamless application upgrades, ensuring zero downtime. Kernel and database optimizations enhance system performance, while the CI/CD pipeline is powered by GitLab for automated testing and deployment.  
  
🛠 **Key Components**  
  
1. **OpenVPN**:  
   - Chose OpenVPN over CloudVPN for control and customization of internal networks.  
  
2. **Internal DNS Server**:  
   - Preferred over CloudDNS to reduce latency and maintain control over internal communications.  
  
3. **Proxy Server**:  
   - Used for routing, security, and access control between internal and external services.  
  
4. **Kernel Settings Optimization**:  
   - Adjusted parameters like `vm.swappiness`, `fs.file-max`, and `net.ipv4.tcp_rmem` to optimize system performance for production.  
  
5. **Database Settings Tuning**:  
   - Tuned `max_locks_per_transaction` to improve transaction throughput in PostgreSQL.  
  
6. **Helm & Blue-Green Deployment**:  
   - Deployed applications via Helm and used Blue-Green deployment to ensure zero-downtime updates.  
  
⚙️ **Architecture Overview**  
   
1. **VPN**: Internal traffic is secured with OpenVPN.  
2. **Internal DNS**: Ensures fast and secure DNS resolution for internal services.  
3. **Proxy**: Provides centralized routing and security control between services.  
4. **Kubernetes**: Manages containers and workloads, with deployments handled through Helm.  
5. **Blue-Green Deployment**: Maintains high availability during application updates, allowing traffic to switch between two environments (bluegreen) without downtime.  
  
![Architecture Diagram](link_to_image_diagram)  
  
🔧 **Why these Choices?**  
  
1. **OpenVPN vs CloudVPN**: The type of VPN I needed (Road-Warrior, or client-to-gateway) isn't implemented in GCP. Therefore, I opted for **OpenVPN** to fulfill the requirement of secure client-to-gateway communication.
2. **Internal DNS vs CloudDNS**: I initially considered **CloudDNS**, but it didn't work with my laptop when connected through VPN, as it falls outside the GCP environment. I chose an **Internal DNS server** instead to maintain reliable DNS resolution for internal services.
3. **Kernel & DB Optimization**:  
   - **Kernel Settings**: I modified kernel settings by increasing `vm.max_map_count` to 524,288 (from the default 65,530). This was necessary because **SonarQube** uses **Elasticsearch**, which requires a large number of memory-mapped files to index and search data efficiently.  
   - **File Descriptors**: I increased the number of file descriptors that can be opened by all processes on the system, as both **SonarQube** and **Elasticsearch** handle a large number of files simultaneously.  
   - **Security Limits**: I added configurations in `/etc/security/limits.d/` to raise limits for the **SonarQube** user, increasing both the number of file descriptors (`nofile`) and the number of processes (`noproc`) they can create.  
   - **SonarQube Service**: After making these changes, I created a system service to manage **SonarQube** efficiently.
4. **Blue-Green Deployment**: Chosen for zero-downtime updates, ensuring continuous availability during upgrades.  
5. **GitLab CICD**: Fully automated pipelines for testing, building, and deploying the application using Helm.  
6. **HTTPS and Certificates**: Since I used self-signed certificates, I commented out most of the HTTPS-related configuration because **GitLab** and the **GitLab runners** couldn’t trust the self-signed certificate (not being signed by a CA).


🔑 **Resources I Used**  
- [OWASP Dependency Check Dockerfile](https://hub.docker.com/r/owasp/dependency-check/dockerfile)  
- [Nexus Main Port problem: Thanks Rich](https://groups.google.com/a/glists.sonatype.com/g/nexus-users/c/RWAK0BDSowU?pli=1)  
- [Using Sonatype Nexus Repository 3 for Docker Images](https://www.sonatype.com/blog/using-sonatype-nexus-repository-3-part-3-docker-images)  
- [Blue/Green Kubernetes deployments using Helm and CI/CD](https://www.youtube.com/watch?v=er0JTGnryZ4)  
- [GitLab CI/CD to Deploy Applications on GKE](https://medium.com/@jaydeepawar4912/gitlab-ci-cd-to-deploy-applications-on-gke-806658160534)  
- [What is HELM ?](https://www.youtube.com/watch?v=-ykwb1d0DXU)  
- [Installing Helm in Google Kubernetes Engine](https://medium.com/google-cloud/installing-helm-in-google-kubernetes-engine-7f07f43c536e)  
  
  
📝 **Workflow & Branching**  

### CI/CD Workflow and Branch Strategy

1. **Develop Branch**:  
   - Active development occurs here.  
   - Features and updates are developed and tested in this branch before merging into the `main` branch.  
   - Continuous Integration (CI) automatically builds and tests code on every commit.

2. **Staging Branch**:  
   - Used for deploying the new version to a **staging environment** in **Google Kubernetes Engine (GKE)**.  
   - A **blue-green deployment** strategy is applied, where the new version is deployed to a free environment (either blue or green).  
   - Teams (QA testers or developers) access the staging environment via a temporary **service** or **port-forwarding** for testing purposes.

3. **Main Branch (Master)**:  
   - Contains **production-ready code**.  
   - Once the new version in staging is verified, the **Helm chart** switches the service to point to the appropriate environment (either blue or green), ensuring a **seamless transition** without downtime.

4. **GitLab CI Pipeline**:  
   - Automates the process of scanning, building, and testing the application on every push.  
   - If all tests pass, the CI pipeline triggers a **Helm deployment** using the **Blue-Green deployment** strategy, deploying the new version to GKE.  
   - Ensures that changes are gradually rolled out and tested before becoming live in production.

  
📈 **Technical Considerations**  
- Kernel Optimization: Increased vm.max_map_count to allow more memory-mapped areas for Elasticsearch in SonarQube, and increased file descriptors and process limits for high-performance workloads.
- Database Tuning: Adjusted file descriptors and process limits to support concurrent transactions efficiently in SonarQube and other applications.
- OpenVPN vs CloudVPN: Opted for OpenVPN due to GCP’s lack of support for client-to-gateway VPN (Road Warrior) and internal network security customization.
- Internal DNS vs CloudDNS: Decided not to use CloudDNS because it doesn’t function properly when accessed over VPN from outside the GCP environment.
- Blue-Green Deployment Strategy: Enabled zero-downtime updates by switching environments using Helm and GitLab CI/CD pipelines.
- GitLab CI Pipeline: Automated pipelines for scanning, building, testing, and deploying with Helm, following best practices for DevSecOps. 
  
🎯 **Goals Achieved**  
- Fully automated infrastructure with secure networking through OpenVPN, internal DNS, and a proxy server.
- Enhanced system performance with kernel tuning for Elasticsearch and database optimizations for high concurrency.
- Scalable, zero-downtime deployments via Helm and Blue-Green strategy, ensuring seamless production updates.
- Continuous Integration and Delivery (CI/CD) with GitLab pipelines, enabling efficient development cycles with automated security and testing tools (SAST, DAST, SCA, and CIS).


📦 **Deployment Steps**  
  
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
   - **CIS**: Google SDK (GCP), Trivy (custom GCP image with Helm installed)
   
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

