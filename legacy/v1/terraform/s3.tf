# S3 bucket for website
resource "aws_s3_bucket" "root_bucket" {
  bucket = var.bucket_name
  tags   = var.common_tags

  # Provisioner to clean up S3 bucket contents on destroy
  provisioner "local-exec" {
    when    = destroy
    command = "aws s3 rm s3://${self.bucket} --recursive"
  }
}

# S3 Website Configuration
resource "aws_s3_bucket_website_configuration" "website_config" {
  bucket = aws_s3_bucket.root_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# CORS Configuration for the S3 bucket
resource "aws_s3_bucket_cors_configuration" "cors_config" {
  bucket = aws_s3_bucket.root_bucket.id

  cors_rule {
    allowed_headers = ["Authorization", "Content-Length"]
    allowed_methods = ["GET", "POST"]
    allowed_origins = ["https://${var.domain_name}"]
    max_age_seconds = 3000
  }
}

# S3 Bucket Policy
resource "aws_s3_bucket_policy" "policy" {
  bucket = aws_s3_bucket.root_bucket.id  # Referencing bucket ID

  policy = templatefile("templates/s3-policy.json", {
    bucket = var.bucket_name
  })
}

# S3 Bucket ACL (optional, for public-read access)
resource "aws_s3_bucket_acl" "example_bucket_acl" {
  bucket = aws_s3_bucket.root_bucket.id
  acl    = "public-read"
}

# IAM Policy Document for the bucket policy
data "aws_iam_policy_document" "s3_policy_document" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${aws_s3_bucket.root_bucket.bucket}/*"]
    effect    = "Allow"
  }
}

# S3 Sync (for syncing the local build to the S3 bucket)
resource "null_resource" "s3_sync" {
  depends_on = [aws_s3_bucket.root_bucket]

  triggers = {
    always_run = timestamp()
  }

  # This script requires AWS CLI
  provisioner "local-exec" {
    command = <<-EOT
      aws s3 sync ../build s3://${var.bucket_name}
    EOT
  }
}