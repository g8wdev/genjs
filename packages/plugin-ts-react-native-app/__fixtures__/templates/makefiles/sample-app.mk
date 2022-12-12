prefix ?= myprefix
bucket_prefix ?= $(prefix)-myproject
env ?= dev
AWS_PROFILE ?= $(prefix)-$(env)
bucket ?= $(env)-$(bucket_prefix)-app
cloudfront ?= $(AWS_CLOUDFRONT_DISTRIBUTION_ID_APP)

build: ## Build
	@yarn --silent build

deploy: deploy-code invalidate-cache
deploy-code: ## Synchronize remote S3 bucket with local directory
	@AWS_EC2_METADATA_DISABLED=true AWS_PROFILE=$(AWS_PROFILE) aws s3 sync build/ s3://$(bucket) --delete

generate-env-local: ## Generate the .env.local file based on dynamic configuration
	@../node_modules/.bin/env REACT_APP_ > ./.env.local
	@../node_modules/.bin/generate-vars-from-terraform-outputs ../outputs/$(env) ./terraform-to-vars.json >> ./.env.local

install: ## Install the Javascript dependencies
	@yarn --silent install

invalidate-cache: ## Invalidate the CloudFront CDN cache
	@AWS_EC2_METADATA_DISABLED=true AWS_PROFILE=$(AWS_PROFILE) aws cloudfront create-invalidation --distribution-id $(cloudfront) --paths '/*' --no-paginate --color off --no-cli-pager --output text

pre-install:
	@true

start: ## Start (local)
	@yarn --silent start

test: ## Execute the tests
	@CI=true yarn --silent test --all --color --detectOpenHandles
test-dev: ## Execute the tests
	@yarn --silent test --all --color --detectOpenHandles

.DEFAULT_GOAL := install
.PHONY: build \
		deploy deploy-code \
		generate-env-local \
		install \
		invalidate-cache \
		pre-install \
		start \
		test test-dev