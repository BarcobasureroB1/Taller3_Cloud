output "bucket_name" {
  description = "bucket creado"
  value       = aws_s3_bucket.drive.bucket
}

output "bucket_arn" {
  description = "ARN del bucket creado"
  value       = aws_s3_bucket.drive.arn
}
