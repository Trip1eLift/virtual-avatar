variable "domain_name" {
  type = string
  description = "The domain name for the website."
}

variable "bucket_name" {
  type = string
  description = "<app name>.<domain name> This bucket name will be the url of the website."
}

variable "common_tags" {
  description = "Common tags you want applied to all components."
}

variable "hosted_zone_id" {
  description = "Id of the existing hosted zone."
}

variable "app_name" {
  description = "Unused variable."
}
