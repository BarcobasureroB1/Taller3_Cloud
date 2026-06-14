variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "localstack_endpoint" {
  description = "Endpoint donde escucha LocalStack desde el host"
  type        = string
  default     = "http://localhost:4566"
}

variable "bucket_name" {
  description = "Clon drive Cloud computing"
  type        = string
  default     = "drive-clone-bucket"
}
