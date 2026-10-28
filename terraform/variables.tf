variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "worker_name" {
  description = "Name of the Cloudflare Worker"
  type        = string
  default     = "student-task-manager"
}

variable "kv_namespace_name" {
  description = "Title of the Workers KV namespace"
  type        = string
  default     = "student_tasks"
}

variable "environment" {
  description = "Deployment environment label (exposed to the Worker)"
  type        = string
  default     = "dev"
}

variable "app_title" {
  description = "Application title shown in the web UI (change this to demo an infrastructure update)"
  type        = string
  default     = "Student Task Manager"
}

variable "account_subdomain" {
  description = "Your workers.dev subdomain (Workers & Pages > Overview). Only used to build the output URL."
  type        = string
  default     = ""
}
