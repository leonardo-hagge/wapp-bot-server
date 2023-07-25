import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1689962443312 implements MigrationInterface {
    name = 'Default1689962443312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "deletado" boolean NOT NULL DEFAULT false, "dateCreation" TIMESTAMP NOT NULL DEFAULT now(), "dateModification" TIMESTAMP DEFAULT now(), "from" character varying, "to" character varying, "alias_user" character varying, "message" text, "type" character varying, "image" text, "received" boolean NOT NULL DEFAULT false, "sent" boolean NOT NULL DEFAULT false, "dateEvent" TIMESTAMP, "chatId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "chat" ("id" SERIAL NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "deletado" boolean NOT NULL DEFAULT false, "dateCreation" TIMESTAMP NOT NULL DEFAULT now(), "dateModification" TIMESTAMP DEFAULT now(), "name" character varying, "indentification" character varying NOT NULL, "isGroupChat" boolean DEFAULT false, "isPrivateChat" boolean DEFAULT false, "groupId" character varying, "deviceId" integer, CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_7f97755cf1c30bdc749c37d0c2c" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_7f97755cf1c30bdc749c37d0c2c"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"`);
        await queryRunner.query(`DROP TABLE "chat"`);
        await queryRunner.query(`DROP TABLE "message"`);
    }

}
