# S3 bucket for website.
resource "aws_s3_bucket" "root_bucket" {
  bucket = "${var.bucket_name}"
  policy = templatefile("templates/s3-policy.json", { bucket = "${var.bucket_name}" })

  tags = var.common_tags
}

resource "aws_s3_bucket_website_configuration" "root_bucket" {
	bucket = aws_s3_bucket.root_bucket.bucket
	
	index_document {
		suffix = "index.html"
	}

	error_document {
		key = "404.html"
	}
}

resource "aws_s3_bucket_acl" "example_bucket_acl" {
  bucket = aws_s3_bucket.root_bucket.id
  acl    = "public-read"
}

resource "aws_s3_bucket_cors_configuration" "root_bucket" {
	bucket = aws_s3_bucket.root_bucket.id

	cors_rule {
		allowed_headers = ["Authorization", "Content-Length"]
		allowed_methods = ["GET", "POST"]
		allowed_origins = ["https://${var.domain_name}"]
		max_age_seconds = 3000
	}
}

# use non-www only for now.

# S3 bucket for redirecting www to non-www.
# resource "aws_s3_bucket" "root_bucket" {
#   bucket = var.bucket_name
#   acl = "public-read"
#   policy = templatefile("templates/s3-policy.json", { bucket = var.bucket_name })

#   website {
#     redirect_all_requests_to = "https://www.${var.domain_name}"
#   }

#   tags = var.common_tags
# }