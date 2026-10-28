terraform {
  required_version = ">= 1.6.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.10"
    }
  }
}

# Credentials are NOT written here.
# The provider reads the CLOUDFLARE_API_TOKEN environment variable
# (locally: export it; in CI: GitHub Secret).
provider "cloudflare" {}
