-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COMPLIANCE_MANAGER', 'CONTRACT_MANAGER', 'REVIEWER', 'EXPERT_REVIEWER');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'AI_COMPLETE', 'REVIEW_NEEDED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'WARNING', 'NON_COMPLIANT', 'PENDING');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "vendor_type" TEXT,
    "company_id" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "magic_link_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "ai_confidence" DOUBLE PRECISION,
    "ocr_provider" TEXT,
    "ocr_raw_text" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extracted_coverages" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "policy_type" TEXT NOT NULL,
    "policy_number" TEXT,
    "insurer_name" TEXT,
    "insured_name" TEXT,
    "effective_date" TIMESTAMP(3),
    "expiration_date" TIMESTAMP(3),
    "limit_amount" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "deductible" DECIMAL(65,30),
    "endorsements" JSONB NOT NULL DEFAULT '[]',
    "additional_insured" BOOLEAN NOT NULL DEFAULT false,
    "waiver_of_subrogation" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DOUBLE PRECISION,
    "field_confidences" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extracted_coverages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "vendor_type" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirement_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_requirements" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "policy_type" TEXT NOT NULL,
    "min_limit" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "required_endorsements" JSONB NOT NULL DEFAULT '[]',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "template_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_requirements" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "contract_id" TEXT,
    "policy_type" TEXT NOT NULL,
    "min_limit" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "required_endorsements" JSONB NOT NULL DEFAULT '[]',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_results" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "coverage_id" TEXT,
    "status" "ComplianceStatus" NOT NULL,
    "gap_details" JSONB,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "contract_number" TEXT,
    "title" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "insurance_terms" JSONB,
    "document_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tasks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "assigned_to" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "sla_deadline" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_clients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT,
    "sector" TEXT NOT NULL,
    "sub_sector" TEXT,
    "employee_count" INTEGER,
    "annual_revenue" DECIMAL(65,30),
    "risk_profile" JSONB,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_questionnaires" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_documents" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_knowledge_base" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "policy_type" TEXT NOT NULL,
    "policy_type_he" TEXT NOT NULL,
    "recommended_limit" DECIMAL(65,30),
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "common_endorsements" JSONB NOT NULL DEFAULT '[]',
    "risk_factors" JSONB NOT NULL DEFAULT '[]',
    "description" TEXT,
    "description_he" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_documents" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "extracted_data" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "vendor_id" TEXT,
    "client_id" TEXT,

    CONSTRAINT "comparison_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "sector" TEXT,
    "contract_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparison_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_requirements" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "policy_type" TEXT NOT NULL,
    "policy_type_he" TEXT NOT NULL,
    "minimum_limit" DECIMAL(65,30) NOT NULL,
    "maximum_deductible" DECIMAL(65,30),
    "required_endorsements" JSONB NOT NULL DEFAULT '[]',
    "require_additional_insured" BOOLEAN NOT NULL DEFAULT false,
    "require_waiver_subrogation" BOOLEAN NOT NULL DEFAULT false,
    "minimum_validity_days" INTEGER,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "notes_he" TEXT,

    CONSTRAINT "comparison_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparison_analyses" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "overall_status" TEXT NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparison_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_via" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_type" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_products" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coverage_trigger" TEXT NOT NULL,
    "structure" JSONB NOT NULL DEFAULT '{}',
    "insurer" TEXT,
    "bit_standard" TEXT,
    "description" TEXT,
    "description_he" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurance_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_extensions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "chapter_code" TEXT,
    "code" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "default_limit" DECIMAL(65,30),
    "is_first_loss" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_exclusions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "chapter_code" TEXT,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "is_general" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_policy_relations" (
    "id" TEXT NOT NULL,
    "from_product_id" TEXT NOT NULL,
    "to_product_id" TEXT NOT NULL,
    "relation_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cross_policy_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_product_mappings" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "necessity" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sector_product_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurer_policies" (
    "id" TEXT NOT NULL,
    "insurer_id" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "policy_form_code" TEXT,
    "bit_standard" TEXT,
    "edition_year" INTEGER,
    "structure" JSONB NOT NULL DEFAULT '{}',
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "weaknesses" JSONB NOT NULL DEFAULT '[]',
    "notable_terms" JSONB NOT NULL DEFAULT '[]',
    "is_master" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurer_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurer_policy_extensions" (
    "id" TEXT NOT NULL,
    "insurer_policy_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "default_limit" DECIMAL(65,30),
    "limit_notes" TEXT,
    "is_standard" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurer_policy_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurer_policy_exclusions" (
    "id" TEXT NOT NULL,
    "insurer_policy_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "is_standard" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurer_policy_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_templates" (
    "id" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sector_he" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_sections" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_he" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "show_if" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questionnaire_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "label_he" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "placeholder" TEXT,
    "placeholder_he" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "show_if" JSONB,
    "risk_weight" DOUBLE PRECISION DEFAULT 0,
    "policy_affinity" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage_rules" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_he" TEXT NOT NULL,
    "description" TEXT,
    "description_he" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coverage_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_knowledge_base_sector_policy_type_key" ON "insurance_knowledge_base"("sector", "policy_type");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_products_code_key" ON "insurance_products"("code");

-- CreateIndex
CREATE UNIQUE INDEX "policy_extensions_product_id_code_key" ON "policy_extensions"("product_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "policy_exclusions_product_id_name_en_key" ON "policy_exclusions"("product_id", "name_en");

-- CreateIndex
CREATE UNIQUE INDEX "cross_policy_relations_from_product_id_to_product_id_key" ON "cross_policy_relations"("from_product_id", "to_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "sector_product_mappings_sector_product_id_key" ON "sector_product_mappings"("sector", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurers_code_key" ON "insurers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "insurer_policies_insurer_id_product_code_key" ON "insurer_policies"("insurer_id", "product_code");

-- CreateIndex
CREATE UNIQUE INDEX "insurer_policy_extensions_insurer_policy_id_code_key" ON "insurer_policy_extensions"("insurer_policy_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "insurer_policy_exclusions_insurer_policy_id_code_key" ON "insurer_policy_exclusions"("insurer_policy_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_templates_sector_key" ON "questionnaire_templates"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "questions_section_id_question_id_key" ON "questions"("section_id", "question_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_coverages" ADD CONSTRAINT "extracted_coverages_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_templates" ADD CONSTRAINT "requirement_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_requirements" ADD CONSTRAINT "template_requirements_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "requirement_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_requirements" ADD CONSTRAINT "vendor_requirements_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_requirements" ADD CONSTRAINT "vendor_requirements_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "vendor_requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_results" ADD CONSTRAINT "compliance_results_coverage_id_fkey" FOREIGN KEY ("coverage_id") REFERENCES "extracted_coverages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tasks" ADD CONSTRAINT "verification_tasks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tasks" ADD CONSTRAINT "verification_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_clients" ADD CONSTRAINT "rfq_clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_questionnaires" ADD CONSTRAINT "rfq_questionnaires_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "rfq_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_documents" ADD CONSTRAINT "rfq_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "rfq_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_requirements" ADD CONSTRAINT "comparison_requirements_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "comparison_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_analyses" ADD CONSTRAINT "comparison_analyses_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "comparison_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparison_analyses" ADD CONSTRAINT "comparison_analyses_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "comparison_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_extensions" ADD CONSTRAINT "policy_extensions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "insurance_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_exclusions" ADD CONSTRAINT "policy_exclusions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "insurance_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_policy_relations" ADD CONSTRAINT "cross_policy_relations_from_product_id_fkey" FOREIGN KEY ("from_product_id") REFERENCES "insurance_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_policy_relations" ADD CONSTRAINT "cross_policy_relations_to_product_id_fkey" FOREIGN KEY ("to_product_id") REFERENCES "insurance_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_product_mappings" ADD CONSTRAINT "sector_product_mappings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "insurance_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurer_policies" ADD CONSTRAINT "insurer_policies_insurer_id_fkey" FOREIGN KEY ("insurer_id") REFERENCES "insurers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurer_policy_extensions" ADD CONSTRAINT "insurer_policy_extensions_insurer_policy_id_fkey" FOREIGN KEY ("insurer_policy_id") REFERENCES "insurer_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurer_policy_exclusions" ADD CONSTRAINT "insurer_policy_exclusions_insurer_policy_id_fkey" FOREIGN KEY ("insurer_policy_id") REFERENCES "insurer_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_sections" ADD CONSTRAINT "questionnaire_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "questionnaire_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "questionnaire_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coverage_rules" ADD CONSTRAINT "coverage_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "questionnaire_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

