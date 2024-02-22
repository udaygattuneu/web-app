variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "source_image_family" {
  description = "The source image family for the base image"
  type        = string
}

variable "image_name" {
  description = "The name of the resulting custom image"
  type        = string
}

variable "ssh_username" {
  description = "The username for SSH access"
  type        = string
}

variable "zone" {
  description = "The GCP zone where the image will be built"
  type        = string
}
