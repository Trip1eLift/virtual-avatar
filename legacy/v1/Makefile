start:
	npm start

remove-build:
	rm -rf build

build: remove-build
	npm run build

dev: build
	serve -s build

deploy: build
	cd terraform; terraform init
	cd terraform; terraform apply

upload:
	aws s3 sync ./build s3://virtualavatar.trip1elift.com