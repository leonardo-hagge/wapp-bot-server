import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity('device')
export class Device extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    number: string

    @Column()
    alias: string

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    dateCreation: Date

    @Column({ nullable: true, type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    dateModification: Date
}