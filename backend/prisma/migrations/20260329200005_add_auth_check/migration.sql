-- This is an empty migration.
ALTER TABLE "auth"
ADD CONSTRAINT "auth_provider_check"
CHECK (
  (provider = 'local' AND "password" IS NOT NULL) OR
  (provider <> 'local' AND "providerKey" IS NOT NULL)
);