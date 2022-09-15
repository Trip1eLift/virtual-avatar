# Deployment Gudie

1. Check variables in terraform.tfvars

2. Run terraform command

```console
terraform init

terraform plan

terraform apply
```

3. Upload build files

```
cd app-root

npm install && npm run build

cd ./build

aws s3 sync . s3://virtualavatar.trip1elift.com
```