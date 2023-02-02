# SSL Certificate
resource "aws_acm_certificate" "ssl_certificate" {
  provider = aws.acm_provider
  domain_name = var.bucket_name
  subject_alternative_names = ["*.${var.bucket_name}"]
  validation_method = "EMAIL"

  tags = var.common_tags

  lifecycle {
    create_before_destroy = true
  }
}

# Uncomment the validation_record_fqdns line if you do DNS validation instead of Email.
resource "aws_acm_certificate_validation" "cert_validation" {
  provider = aws.acm_provider
  certificate_arn = aws_acm_certificate.ssl_certificate.arn
}