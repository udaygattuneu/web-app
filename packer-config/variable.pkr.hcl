variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default = "dev-cloud-415015"
}
variable "zone" {
  description = "The GCP zone where the image will be built"
  type        = string
  default = "us-east4-a"
}
variable "image_name" {
  description = "The name of the resulting custom image"
  type        = string
  default = "centos-stream-8-custom3-image"
}
variable "source_image_family" {
  description = "The source image family for the base image"
  type        = string
  default = "centos-stream-8"
}


// variable "ssh_username" {
//   description = "The username for SSH access"
//   type        = string
//   default = "centos"
// }


