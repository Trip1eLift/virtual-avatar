resource "aws_route53_record" "root-a" {
  zone_id = var.hosted_zone_id
  name = var.bucket_name
  type = "A"
  # ttl  = 300 # TTL for all alias records is 60 seconds, you cannot change this, therefore ttl has to be omitted in alias records.
  alias {
    name = aws_cloudfront_distribution.root_s3_distribution.domain_name
    zone_id = aws_cloudfront_distribution.root_s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}