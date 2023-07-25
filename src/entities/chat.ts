import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseModal } from "./base-model";
import { Device } from "./device";
import { Message } from "./message";

@Entity('chat')
export class Chat extends BaseModal {

  @Column({ nullable: true })
  name: string;

  @ManyToOne(() => Device, device => device.id)
  // @ManyToMany(() => Device, device => device.id)
  @JoinColumn()
  device: Device;

  @OneToMany(() => Message, (message) => message.chat, { cascade: false })
  messages: Message[];

  @Column()
  indentification: string;

  @Column({ nullable: true, default: false })
  isGroupChat: boolean;

  @Column({ nullable: true, default: false })
  isPrivateChat: boolean;

  @Column({ nullable: true })
  groupId: string;


}