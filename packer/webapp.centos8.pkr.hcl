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
  image_name          = var.image_name
  source_image_family = var.source_image_family
  ssh_username        = "centos"
  zone                = var.zone
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
  // provisioner "file" {
  //   source      = "../.env"
  //   destination = "/tmp/.env"
  // }
  provisioner "file" {
    source      = "../web-App.zip"
    destination = "/tmp/web-App.zip"
  }

  provisioner "shell" {
    script = "Nodejs.sh"
  }



}
 