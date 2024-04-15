variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "dev-cloud-415015"
}
variable "zone" {
  description = "The GCP zone where the image will be built"
  type        = string
  default     = "us-east4-a"
}

variable "source_image_family" {
  description = "The source image family for the base image"
  type        = string
  default     = "centos-stream-8"
}

