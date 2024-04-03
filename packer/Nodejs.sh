#!/bin/bash


sudo dnf update -y
 
# # Install MySQL
# sudo dnf install -y mysql-server
# sudo systemctl enable mysqld
# sudo systemctl start mysqld
 

 
 
# # Set root user password for MySQL
# sudo mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Uday123@';
# CREATE DATABASE IF NOT EXISTS db1; SHOW GRANTS FOR 'root'@'localhost';"
# sudo firewall-cmd --zone=public --add-port=3306/tcp --permanent
# sudo firewall-cmd --reload

 #
sudo groupadd -f csye6225
 
# Create user csye6225 and add to group csye6225
sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
 
 
sudo cp /tmp/csye6225.service /lib/systemd/system/csye6225.service
 
# Install unzip
sudo dnf install -y unzip
 
sudo dnf install httpd -y
 
sudo dnf module enable -y nodejs:20
sudo dnf install -y npm
 
   
sudo cp /tmp/web-app.zip /opt/web-app.zip
 cd /opt || exit
 sudo unzip web-app.zip
 sudo cp /tmp/.env /opt/web-app
#  sudo cp /tmp/web-app/.env /opt/web-app/.env
    # cd web-app/ || exit
    sudo chown -R csye6225:csye6225 /opt/web-app
 
    sudo chmod -R 750 /opt/web-app
    # Install Node.js and npm
   #  sudo cd /opt/web-app || exit
    sudo npm install
    sudo npm uninstall bcrypt
    sudo npm install winston

    sudo npm install bcrypt@5.1.1
    sudo npm install --build-from-source=false
 
    sudo curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

logger=$(cat << EOF
logging:
  receivers:
    webapp-receiver:
      type: files
      include_paths:
        - /var/log/web-app/webapp.log
      record_log_file_path: true
  processors:
    webapp-processor:
      type: parse_json
      time_key: time
      time_format: "YYYY-MM-DDTHH:mm:ss.SSSZ"
    move_severity:
      type: modify_fields
      fields:
        severity:
          move_from: jsonPayload.severity
  service:
    pipelines:
      default_pipeline:
        receivers: [webapp-receiver]
        processors: [webapp-processor, move_severity]
EOF
)
 
# Backup the old config.yml file
sudo cp /etc/google-cloud-ops-agent/config.yaml /etc/google-cloud-ops-agent/config.yaml.backup
 
# Create a new config.yml file
echo "$logger" | sudo tee /etc/google-cloud-ops-agent/config.yaml >/dev/null
 
# Set permissions for the new config.yml file
sudo chown -R csye6225:csye6225 /etc/google-cloud-ops-agent/config.yaml
 
sudo mkdir -p /var/log/web-app
 
sudo touch /var/log/web-app/webapp.log
 
sudo chown -R csye6225:csye6225 /var/log/web-app

sudo systemctl enable google-cloud-ops-agent
sudo systemctl start google-cloud-ops-agent
sudo systemctl restart google-cloud-ops-agent



    # sudo npm test
 
    sudo systemctl daemon-reload
    sudo systemctl enable httpd
    sudo systemctl start httpd
    sudo systemctl enable csye6225
    sudo systemctl start csye6225
    sudo systemctl status csye6225
    sudo journalctl -xe 
