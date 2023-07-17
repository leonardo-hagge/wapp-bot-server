import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToMany, JoinColumn, ManyToOne } from "typeorm"
import { Device } from "./device";
import { BaseModal } from "./base-model";

@Entity('chat')
export class Chat extends BaseModal {

  @ManyToOne(() => Device)
  // @ManyToMany(() => Device, device => device.id)
  @JoinColumn()
  device: Device;

  @Column({ nullable: true })
  other_device_number: string


  @Column({ nullable: true })
  from: string;

  @Column({ nullable: true })
  to: string;


  @Column({ nullable: true })
  alias_user: string;

  @Column({ type: "text", nullable: true })
  message: string

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ default: false })
  received: boolean;

  @Column({ default: false })
  sent: boolean;


  @Column({ type: "datetime", nullable: true })
  dateEvent: Date
}