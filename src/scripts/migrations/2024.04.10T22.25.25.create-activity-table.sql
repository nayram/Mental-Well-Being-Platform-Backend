CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE "activity" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "title" character varying NOT NULL,
    "description" TEXT,
    "category" character varying NOT NULL,
    "duration" BIGINT NOT NULL,
    "difficulty_level" character varying NOT NULL,
    "content" TEXT,
    "status" character varying NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP DEFAULT now(),
    CONSTRAINT "PK_8d12ff38fcc62cd7b25642b2d19" PRIMARY KEY ("id")
);
