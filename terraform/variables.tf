variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "Existing EC2 key pair name (no .pem)"
}

variable "my_ip" {
  type        = string
  description = "Your public IP in CIDR form, e.g. 1.2.3.4/32"
}

variable "repo_url" {
  type        = string
  description = "Public git URL to clone and run with docker compose"
}
