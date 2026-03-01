# Unwastify

A smart household grocery-management and waste-reduction web app. Track your pantry, monitor expiry dates, log food waste, and automatically generate a personalized weekly shopping list powered by a machine-learning model.

Live URL: https://d1yat59iwg4dcp.cloudfront.net
---

## Features

- **Pantry management** – Add grocery items with name, quantity, and expiry date. Items expiring within 48 hours are flagged on the dashboard.
- **Waste tracking** – Mark wasted quantities per item and track a live Zero-Waste Score.
- **Expired items** – Separate view of expired items sorted from most-recently expired to oldest.
- **Family profile** – Set household size, meals per day, and eat-out frequency to personalise predictions.
- **Shopping list** – ML-generated weekly shopping list. Mark items as bought or delete them.
- **Dashboard** – Weekly summary with stats, expiring-soon list, zero-waste score, and day-aware prompts:
  - **Friday / Saturday** – Prompt to update your family profile before the week's list generates.
  - **Sunday** – Notification that your shopping list is ready.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, AWS Amplify JS |
| Auth | Amazon Cognito (User Pools) |
| API | Amazon API Gateway (REST) |
| Backend | AWS Lambda (Python 3.13) |
| ML model | Lambda container (Docker) via Amazon ECR |
| Database | Amazon DynamoDB |
| Hosting | S3 + CloudFront |
| CI/CD | AWS CodePipeline + CodeBuild |
| IaC | Terraform 1.5.7 |

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- AWS CLI configured
- Terraform 1.5.7

### Run the frontend locally

```bash
cd unwastify-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. It connects to the deployed AWS backend.

### Deploy infrastructure manually

```bash
cd terraform
# Zip all lambdas
for lambda in add_to_pantry delete_pantry_item delete_shopping_item generate_shopping_list \
  get_family_info get_pantry get_shopping_list mark_as_bought mark_expired mark_wasted \
  post_confirmation update_family_info; do
  zip -j lambdas/$lambda.zip src/$lambda.py layers/common_utils/python/decimal_helper.py
done

terraform init
terraform apply
```

---

## CI/CD Pipeline

Any push to the `main` branch on GitHub automatically:
1. Zips all Lambda source files
2. Runs `terraform apply` to provision/update all AWS infrastructure
3. Builds the React frontend (`npm run build`)
4. Syncs the build to S3 (`aws s3 sync dist/ s3://unwastify-frontend --delete`)

---

## Environment

The frontend reads Cognito config from `src/aws-exports.js`. Update this file if you redeploy Cognito with a new User Pool or App Client ID.
