-- AlterTable
ALTER TABLE "comparison_requirements" ADD COLUMN     "cancellation_notice_days" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'ILS',
ADD COLUMN     "minimum_limit_per_occurrence" DECIMAL(65,30),
ADD COLUMN     "minimum_limit_per_period" DECIMAL(65,30),
ADD COLUMN     "policy_wording" TEXT,
ADD COLUMN     "service_codes" JSONB NOT NULL DEFAULT '[]';
