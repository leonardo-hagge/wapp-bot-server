import { MigrationInterface, QueryRunner } from "typeorm";

export class Default1689877991803 implements MigrationInterface {
    name = 'Default1689877991803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "device" ("id" SERIAL NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "deletado" boolean NOT NULL DEFAULT false, "dateCreation" date NOT NULL DEFAULT now(), "dateModification" date DEFAULT now(), "number" character varying NOT NULL, "alias" character varying NOT NULL, "isAuthenticated" boolean NOT NULL DEFAULT false, "isRunning" boolean NOT NULL DEFAULT false, "qrcode_authentication" text NOT NULL, CONSTRAINT "PK_2dc10972aa4e27c01378dad2c72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" SERIAL NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "deletado" boolean NOT NULL DEFAULT false, "dateCreation" date NOT NULL DEFAULT now(), "dateModification" date DEFAULT now(), "from" character varying, "to" character varying, "groupId" character varying, "alias_user" character varying, "message" text, "type" character varying, "image" text, "received" boolean NOT NULL DEFAULT false, "sent" boolean NOT NULL DEFAULT false, "dateEvent" date, "chatId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Chat" ("id" SERIAL NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "deletado" boolean NOT NULL DEFAULT false, "dateCreation" date NOT NULL DEFAULT now(), "dateModification" date DEFAULT now(), "name" character varying, "deviceId" integer, CONSTRAINT "REL_2d8fee5552cb02dc79d09120fb" UNIQUE ("deviceId"), CONSTRAINT "PK_d9fa791e91c30baf21d778d3f2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_619bc7b78eba833d2044153bacc" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Chat" ADD CONSTRAINT "FK_2d8fee5552cb02dc79d09120fb8" FOREIGN KEY ("deviceId") REFERENCES "device"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Chat" DROP CONSTRAINT "FK_2d8fee5552cb02dc79d09120fb8"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_619bc7b78eba833d2044153bacc"`);
        await queryRunner.query(`DROP TABLE "Chat"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "device"`);
    }

}
