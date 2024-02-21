packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }
  }
}

source "googlecompute" "Webapp-packer" {
  project_id           = "dev-cloud-415015"
  source_image_family  = "centos-stream-8"
  image_name           = "centos-stream-8-custom3-${formatdate("YYYYMMDDHHmmss", timestamp())}"
  ssh_username         =  "centos"
  zone                 = "us-east4-a"
}
// source "googlecompute" "Webapp-packer" {
//   project_id           = var.project_id
//   source_image_family  = var.source_image_family
//   image_name           = var.image_name
//   ssh_username         = var.ssh_username
//   zone                 = var.zone
// }



build {
  sources = ["source.googlecompute.Webapp-packer"]
 
  provisioner "file"{
    source ="./csye6225.service"
    destination = "/tmp/csye6225.service"
  }
  provisioner "file"{
    source = "./packer-config/Nodejs.sh"
    destination = "/tmp/Nodejs.sh"

  }
  provisioner "file" {
  source      = "/Users/udaygattu/Documents/Cloud/assignment4cloud/web-app.zip"
  destination = "/tmp/web-app.zip"

}

 provisioner "shell"{
    script= "./packer-config/Nodejs.sh"
  }
 
  
}