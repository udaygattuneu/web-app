project_id           = "dev-cloud-415015"
source_image_family  = "centos-stream-8"
image_name           = "centos-stream-8-custom3-${formatdate("YYYYMMDDHHmmss", timestamp())}"
ssh_username         = "centos"
zone                 = "us-east4-a"