# 1. Workers KV namespace -------------------------------------------------
resource "cloudflare_workers_kv_namespace" "tasks" {
  account_id = var.account_id
  title      = var.kv_namespace_name
}

# 2. Worker (container resource) -----------------------------------------
resource "cloudflare_worker" "app" {
  account_id = var.account_id
  name       = var.worker_name

  observability = {
    enabled = true
  }
}

# 3. Worker version: code + KV binding + configuration --------------------
resource "cloudflare_worker_version" "app" {
  account_id         = var.account_id
  worker_id          = cloudflare_worker.app.id
  compatibility_date = "2025-06-01"
  main_module        = "worker.js"

  modules = [
    {
      name         = "worker.js"
      content_type = "application/javascript+module"
      content_file = "${path.module}/../application/worker.js"
    },
    {
      name         = "index.html"
      content_type = "text/plain"
      content_file = "${path.module}/../application/index.html"
    },
    {
      name         = "style.css"
      content_type = "text/plain"
      content_file = "${path.module}/../application/style.css"
    },
    {
      name         = "script.js"
      content_type = "text/plain"
      content_file = "${path.module}/../application/script.js"
    },
  ]

  bindings = [
    {
      # Worker <-> KV binding: available in code as env.TASKS_KV
      type         = "kv_namespace"
      name         = "TASKS_KV"
      namespace_id = cloudflare_workers_kv_namespace.tasks.id
    },
    {
      type = "plain_text"
      name = "ENVIRONMENT"
      text = var.environment
    },
    {
      type = "plain_text"
      name = "APP_TITLE"
      text = var.app_title
    },
  ]
}

# 4. Deployment: send 100% of traffic to the version above ----------------
resource "cloudflare_workers_deployment" "app" {
  account_id  = var.account_id
  script_name = cloudflare_worker.app.name
  strategy    = "percentage"

  versions = [
    {
      percentage = 100
      version_id = cloudflare_worker_version.app.id
    }
  ]
}

# 5. Public URL on workers.dev --------------------------------------------
resource "cloudflare_workers_script_subdomain" "app" {
  account_id  = var.account_id
  script_name = cloudflare_worker.app.name
  enabled     = true

  depends_on = [cloudflare_workers_deployment.app]
}
