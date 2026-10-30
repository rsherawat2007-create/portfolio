-- ============================================================================
-- Migration: 20261030200000_supabase_security_hardening
-- Purpose: Resolve Supabase Security Advisor findings:
--   1. Enable Row Level Security (RLS) on all 33 public schema tables.
--   2. Revoke default PostgREST access privileges from anon and authenticated roles.
--   3. Create 39 covering indexes for foreign keys across public tables.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable Row Level Security (RLS) on all 33 public tables
-- ----------------------------------------------------------------------------
ALTER TABLE public."Achievement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Certificate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DailyLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Education" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Experience" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Experiment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExtracurricularActivity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."FileAttachment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Hackathon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."IntegratedProject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lab" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MistakeJournal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OpenSourceContribution" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectMilestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RateLimitRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Recommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ResearchPaper" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RevokedToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Roadmap" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RoadmapItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SkillDependency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."UserSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."WeeklyReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Revoke privileges from PostgREST roles (anon, authenticated) in public schema
--    Protects sensitive User data (e.g. password hashes) and private tables from direct Data API access.
--    Server-side Prisma connects as table owner (postgres role) with BYPASSRLS, unaffected.
-- ----------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Create covering indexes for 39 foreign-key relationships
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Achievement_userId_idx" ON public."Achievement"("userId");
CREATE INDEX IF NOT EXISTS "Application_userId_idx" ON public."Application"("userId");
CREATE INDEX IF NOT EXISTS "Certificate_userId_idx" ON public."Certificate"("userId");
CREATE INDEX IF NOT EXISTS "DailyLog_userId_idx" ON public."DailyLog"("userId");
CREATE INDEX IF NOT EXISTS "Education_userId_idx" ON public."Education"("userId");
CREATE INDEX IF NOT EXISTS "Evidence_userId_idx" ON public."Evidence"("userId");
CREATE INDEX IF NOT EXISTS "Evidence_skillId_idx" ON public."Evidence"("skillId");
CREATE INDEX IF NOT EXISTS "Experience_userId_idx" ON public."Experience"("userId");
CREATE INDEX IF NOT EXISTS "Experiment_userId_idx" ON public."Experiment"("userId");
CREATE INDEX IF NOT EXISTS "ExtracurricularActivity_userId_idx" ON public."ExtracurricularActivity"("userId");
CREATE INDEX IF NOT EXISTS "FileAttachment_userId_idx" ON public."FileAttachment"("userId");
CREATE INDEX IF NOT EXISTS "FileAttachment_educationId_idx" ON public."FileAttachment"("educationId");
CREATE INDEX IF NOT EXISTS "FileAttachment_labId_idx" ON public."FileAttachment"("labId");
CREATE INDEX IF NOT EXISTS "FileAttachment_projectId_idx" ON public."FileAttachment"("projectId");
CREATE INDEX IF NOT EXISTS "FileAttachment_certificateId_idx" ON public."FileAttachment"("certificateId");
CREATE INDEX IF NOT EXISTS "FileAttachment_experienceId_idx" ON public."FileAttachment"("experienceId");
CREATE INDEX IF NOT EXISTS "FileAttachment_hackathonId_idx" ON public."FileAttachment"("hackathonId");
CREATE INDEX IF NOT EXISTS "FileAttachment_extracurricularId_idx" ON public."FileAttachment"("extracurricularId");
CREATE INDEX IF NOT EXISTS "FileAttachment_journalEntryId_idx" ON public."FileAttachment"("journalEntryId");
CREATE INDEX IF NOT EXISTS "FileAttachment_evidenceId_idx" ON public."FileAttachment"("evidenceId");
CREATE INDEX IF NOT EXISTS "Goal_userId_idx" ON public."Goal"("userId");
CREATE INDEX IF NOT EXISTS "Hackathon_userId_idx" ON public."Hackathon"("userId");
CREATE INDEX IF NOT EXISTS "IntegratedProject_userId_idx" ON public."IntegratedProject"("userId");
CREATE INDEX IF NOT EXISTS "JournalEntry_userId_idx" ON public."JournalEntry"("userId");
CREATE INDEX IF NOT EXISTS "Lab_userId_idx" ON public."Lab"("userId");
CREATE INDEX IF NOT EXISTS "MistakeJournal_userId_idx" ON public."MistakeJournal"("userId");
CREATE INDEX IF NOT EXISTS "OpenSourceContribution_userId_idx" ON public."OpenSourceContribution"("userId");
CREATE INDEX IF NOT EXISTS "Project_userId_idx" ON public."Project"("userId");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_projectId_idx" ON public."ProjectMilestone"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectMilestone_userId_idx" ON public."ProjectMilestone"("userId");
CREATE INDEX IF NOT EXISTS "Recommendation_userId_idx" ON public."Recommendation"("userId");
CREATE INDEX IF NOT EXISTS "ResearchPaper_userId_idx" ON public."ResearchPaper"("userId");
CREATE INDEX IF NOT EXISTS "Roadmap_userId_idx" ON public."Roadmap"("userId");
CREATE INDEX IF NOT EXISTS "RoadmapItem_roadmapId_idx" ON public."RoadmapItem"("roadmapId");
CREATE INDEX IF NOT EXISTS "Skill_userId_idx" ON public."Skill"("userId");
CREATE INDEX IF NOT EXISTS "SkillDependency_userId_idx" ON public."SkillDependency"("userId");
CREATE INDEX IF NOT EXISTS "SkillDependency_skillId_idx" ON public."SkillDependency"("skillId");
CREATE INDEX IF NOT EXISTS "SkillDependency_prerequisiteId_idx" ON public."SkillDependency"("prerequisiteId");
CREATE INDEX IF NOT EXISTS "WeeklyReview_userId_idx" ON public."WeeklyReview"("userId");
