# SSL Certificate with DNS Validation
resource "aws_acm_certificate" "ssl_certificate" {
  provider                  = aws.acm_provider
  domain_name               = var.bucket_name
  subject_alternative_names = ["*.${var.bucket_name}"]
  validation_method         = "DNS"

  tags = var.common_tags
}

# DNS Validation Records
resource "aws_route53_record" "cert_validation_records" {
  for_each = {
    for dvo in aws_acm_certificate.ssl_certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  zone_id         = var.hosted_zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.value]
  ttl             = 300

  lifecycle {
    ignore_changes        = [records]
  }
}

# Automatic ACM Certificate Validation
resource "aws_acm_certificate_validation" "cert_validation" {
  provider              = aws.acm_provider
  certificate_arn       = aws_acm_certificate.ssl_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation_records : record.fqdn]
}