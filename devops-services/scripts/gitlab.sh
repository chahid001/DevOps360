#! /bin/bash

sudo apt -y update
sudo apt -y install ca-certificates curl openssh-server postfix tzdata perl
cd /tmp
curl -LO https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh
sudo bash /tmp/script.deb.sh
sudo apt install gitlab-ce