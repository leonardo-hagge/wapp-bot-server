import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseModal } from "./base-model";
import { Device } from "./device";
import { MediaMessageIntegration } from "./media-message-integration";

@Entity('message_integration')
export class MessageIntegration extends BaseModal {


  @ManyToOne(() => Device, device => device.id, { eager: true, })
  @JoinColumn()
  device: Device;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column()
  identification: string;

  @Column({ type: 'varchar', nullable: true })
  contact: string;

  @OneToMany(() => MediaMessageIntegration, (media) => media.message, { cascade: true, eager: true, nullable: true })
  medias: MediaMessageIntegration[];


  @Column({ type: 'boolean', default: true })
  pending: boolean;
}