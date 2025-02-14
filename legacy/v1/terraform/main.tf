# docs: https://www.alexhyett.com/terraform-s3-static-website-hosting

terraform {
  required_version = "~> 1.10.5"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket = "trip1elift-terraform"
    key = "v1-virtualavatar/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

provider "aws" {
  alias = "acm_provider"
  region = "us-east-1"
}