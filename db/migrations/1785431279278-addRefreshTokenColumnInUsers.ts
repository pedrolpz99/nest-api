import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshTokenColumnInUsers1785431279278 implements MigrationInterface {
    name = 'AddRefreshTokenColumnInUsers1785431279278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "hashedRefreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hashedRefreshToken"`);
    }

}
