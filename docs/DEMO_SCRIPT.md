# Demo Script and Viva Preparation

## Before the evaluation (do 30 minutes earlier)

- [ ] Terminal open in `terraform/` with `CLOUDFLARE_API_TOKEN` exported
- [ ] `terraform.tfvars` filled in; infrastructure currently **destroyed** (clean start) or applied, as you prefer
- [ ] Cloudflare dashboard open at Workers & Pages and Workers KV
- [ ] GitHub repo and the Actions tab open in browser tabs
- [ ] VS Code open on `main.tf`
- [ ] Screenshots folder and report ready as backup if the internet fails

## Mandatory demonstration (20 steps from the spec)

| # | Step | What to say / do |
| --- | --- | --- |
| 1 | Show Terraform source | Walk through `providers.tf`, `variables.tf`, `main.tf`, `outputs.tf`. Point out: no token in code. |
| 2 | `terraform validate` | "Checks syntax and internal consistency, not the real cloud." |
| 3 | `terraform plan` | Show the `+` lines. |
| 4 | Explain the plan | "5 resources to add: KV namespace, Worker, Worker version with KV binding, deployment, subdomain." |
| 5 | `terraform apply` | Type `yes`. Wait for "Apply complete!". |
| 6 | Show Worker | Dashboard > Workers & Pages. "Created by Terraform, not by hand." |
| 7 | Show KV | Dashboard > Workers KV > `student_tasks`. |
| 8 | Open application | Use `terraform output application_url`. |
| 9 | Add a task | "Prepare Final Year Project Presentation", High, Pending. |
| 10 | Retrieve | Reload the page; task still there (stored in KV). Optionally open `/api/tasks`. |
| 11 | Update | Change status to Completed. |
| 12 | Delete | Click Delete. |
| 13 | Modify Terraform | Change `app_title` in `terraform.tfvars` to "Cloud-Based Student Task Manager". |
| 14 | `terraform plan` | Shows `~` in-place update. |
| 15 | Explain difference | "Terraform compared desired state (code) with real state and found one change." |
| 16 | Apply | Refresh the app; new title appears. |
| 17 | Show GitHub repo | Commit history, `.gitignore`, README. |
| 18 | Show Actions | A green run triggered by a `git push`. |
| 19 | `terraform destroy` | "Destroy complete!"; refresh dashboard to show Worker and KV gone. |
| 20 | Recreate | `terraform plan` then `terraform apply`; app is back with no manual work. |

**Tip:** if the live apply is slow, narrate the plan while it runs.

## Likely viva questions

**What is Infrastructure as Code?** Managing infrastructure through source-code files instead of manual dashboard configuration, so it can be versioned, reviewed and reproduced.

**Declarative vs imperative?** Declarative: you describe the desired end state and Terraform works out the steps. Imperative: you write the steps yourself (a shell script).

**What is a Terraform provider?** A plugin that lets Terraform manage a platform's API. Ours is `cloudflare/cloudflare`.

**What is Terraform state and why does it matter?** A record mapping each resource in the code to the real resource (by ID). Without it Terraform cannot know what exists. It can contain sensitive values, so it is never committed.

**What do `+`, `~` and `-` mean in a plan?** Create, modify in place, destroy.

**What does `terraform fmt` do?** Formats code into the standard style.

**What does `validate` check vs `plan`?** `validate` checks the configuration offline. `plan` compares code with real infrastructure and previews changes.

**How is the Worker connected to KV?** Through a binding (`TASKS_KV`) declared in Terraform. The code accesses it as `env.TASKS_KV`.

**How does Terraform know to create KV before the Worker?** The Worker version references the KV namespace ID, creating an implicit dependency.

**Why not store the API token in `main.tf`?** Anyone with repo access, now or in history, could use it. We use an environment variable locally and GitHub Secrets in CI.

**Why does CI need remote state?** GitHub runners are temporary; without shared state each run would try to create resources that already exist.

**What happens if someone edits the Worker in the dashboard?** Terraform state and reality drift apart; the next plan will show the difference and may overwrite the manual change. Hence: manage through Terraform only.

**How does the pipeline work?** push > GitHub Actions > init, validate, plan > apply (main branch only) > Cloudflare updated.

**Why apply only on `main`?** Pull requests show the plan for review without changing production.

**Why serverless / why the free plan?** No servers to manage, pay-per-request, and the free tier (100,000 requests/day at the time of writing) is enough for this project.

**Manual vs IaC?** IaC is reproducible, tracked in Git, reviewable via plan, and rebuildable with one command.

**Limitations / future scope?** No authentication; KV is eventually consistent; single environment. Future: auth, custom domain, multiple environments, approval gate before apply.
