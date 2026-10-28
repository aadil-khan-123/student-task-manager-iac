# Student Task Manager — Infrastructure as Code (Terraform + Cloudflare)

Serverless task manager deployed entirely with **Terraform**:
a **Cloudflare Worker** (UI + REST API) backed by **Workers KV**, deployed through **GitHub Actions**.

```
Developer -> git push -> GitHub -> GitHub Actions -> Terraform -> Cloudflare (Worker + KV) -> User
```

## Repository layout

```
terraform/      providers.tf, main.tf, variables.tf, outputs.tf, terraform.tfvars.example
application/    worker.js (API + routing), index.html, style.css, script.js
.github/workflows/deploy.yml   CI/CD pipeline
screenshots/    evidence for the report
```

## Terraform-managed resources

| Resource | Purpose |
| --- | --- |
| `cloudflare_workers_kv_namespace.tasks` | KV namespace `student_tasks` (task storage) |
| `cloudflare_worker.app` | The Worker |
| `cloudflare_worker_version.app` | Code, **`TASKS_KV` binding**, env variables |
| `cloudflare_workers_deployment.app` | Routes 100% traffic to the version |
| `cloudflare_workers_script_subdomain.app` | Enables the `workers.dev` URL |

## REST API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/tasks` | Create task `{title, priority, status}` |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/{id}` | Get one task |
| PUT | `/api/tasks/{id}` | Update task (e.g. `{"status":"Completed"}`) |
| DELETE | `/api/tasks/{id}` | Delete task |

## Prerequisites

Git, Terraform >= 1.6, a GitHub account and a Cloudflare account (Free plan).

## One-time Cloudflare setup

1. **Account ID**: Cloudflare dashboard > Workers & Pages (shown in the right sidebar).
2. **workers.dev subdomain**: Workers & Pages > Overview (needed only for the URL output).
3. **API token**: My Profile > API Tokens > Create Token > Custom token with
   `Account > Workers Scripts > Edit` and `Account > Workers KV Storage > Edit`.

## Run locally (Steps 12–21, 27–29)

```bash
export CLOUDFLARE_API_TOKEN="<your token>"      # never commit this
cd terraform
cp terraform.tfvars.example terraform.tfvars    # fill in account_id + account_subdomain

terraform init
terraform fmt
terraform validate
terraform plan
terraform apply            # provisions KV + Worker + binding + deployment
terraform output           # worker_name, kv_namespace_id, application_url
terraform show             # inspect state
```

**Modification experiment:** change `app_title` (or `environment`) in `terraform.tfvars`,
run `terraform plan` (shows `~` in-place update), then `terraform apply`.

**Destroy and recreate:**

```bash
terraform plan -destroy
terraform destroy
terraform plan
terraform apply            # whole environment is rebuilt from code
```

## CI/CD with GitHub Actions

The workflow runs on every push / PR to `main`: `fmt -check` > `init` > `validate` > `plan`,
and **applies only on pushes to `main`**.

Add in **Settings > Secrets and variables > Actions**:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| Secret | `TF_API_TOKEN` | HCP Terraform user/team API token |
| Variable | `TF_CLOUD_ORGANIZATION` | Your HCP Terraform organization |
| Variable | `TF_WORKSPACE` | Workspace name (set its **Execution Mode = Local**) |
| Variable | `CLOUDFLARE_SUBDOMAIN` | Your workers.dev subdomain |

**Why remote state?** GitHub runners are temporary. Without shared state, each run would try
to create the KV namespace again and fail. HCP Terraform's free tier stores the state for CI.

**Important:** local state and CI state are separate. Do the local lifecycle demo first,
run `terraform destroy`, and only then let CI create the infrastructure (or the reverse).
Do not manage the same Cloudflare resources from both without migrating state.

## Security

`.gitignore` excludes `*.tfstate`, `*.tfvars`, `.terraform/`. Tokens live only in environment
variables / GitHub Secrets. Secrets in a Git repo can be harvested from history even after deletion.

## Evidence checklist (screenshots/)

Terraform version, `init`, `validate`, `plan`, `apply`, Worker + KV in dashboard, working app,
create / update / delete, GitHub repo, GitHub Actions run, `destroy`, recreation.
