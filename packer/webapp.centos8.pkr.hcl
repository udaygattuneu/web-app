packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1.0.0"
    }

  }
}


source "googlecompute" "Webapp-packer" {
  project_id          = var.project_id
  image_name          = "centos-8-stream-image-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  source_image_family = var.source_image_family
  ssh_username        = "centos"
  zone                = var.zone
  ssh_timeout         = "10m"

}

build {
  sources = ["source.googlecompute.Webapp-packer"]


  provisioner "file" {
    source      = "../csye6225.service"
    destination = "/tmp/csye6225.service"
  }
  provisioner "file" {
    source      = "../packer/Nodejs.sh"
    destination = "/tmp/Nodejs.sh"
  }
  provisioner "file" {
    source      = "../.env"
    destination = "/tmp/.env"
  }
  provisioner "file" {
    source      = "../web-app.zip"
    destination = "/tmp/web-app.zip"
  }

  provisioner "shell" {
    script = "Nodejs.sh"
  }
}

