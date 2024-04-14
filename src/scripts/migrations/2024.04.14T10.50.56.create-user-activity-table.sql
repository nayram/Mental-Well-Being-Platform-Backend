CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE "user-activty" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
    "user_id" uuid NOT NULL,
    "activity_id" uuid NOT NULL,
    "status" character varying NOT NULL, 
    "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
    "updated_at" TIMESTAMP DEFAULT now(), 
    CONSTRAINT "UQ_user_activity_id_user_id" UNIQUE ("user_id", "activity_id"),
    CONSTRAINT "FK_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_activity_id" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "PK_yade7a159ff9t2512dd42343860" PRIMARY KEY ("id")
)
