import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { BaseModal } from "./base-model"
import { type } from "os";
import { Contact } from "whatsapp-web.js";

@Entity('device')
export class Device extends BaseModal {
    @Column()
    number: string

    @Column()
    alias: string


    @Column({ default: false })
    isAuthenticated: boolean;

    @Column({ default: false })
    isRunning: boolean;

    @Column({ type: 'text', nullable: true })
    qrcode_authentication: string;



    contacts: Contact[];

}