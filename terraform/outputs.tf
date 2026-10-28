output "worker_name" {
  description = "Name of the deployed Worker"
  value       = cloudflare_worker.app.name
}

output "kv_namespace_id" {
  description = "ID of the Workers KV namespace"
  value       = cloudflare_workers_kv_namespace.tasks.id
}

output "application_url" {
  description = "Public URL of the application"
  value = (
    var.account_subdomain != ""
    ? "https://${var.worker_name}.${var.account_subdomain}.workers.dev"
    : "Set account_subdomain to see the URL (or check Workers & Pages in the dashboard)"
  )
}
