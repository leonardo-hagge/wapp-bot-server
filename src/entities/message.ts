import { Entity, Column, ManyToOne } from "typeorm"
import { BaseModal } from "./base-model";
import { Chat } from "./chat";


@Entity('message')
export class Message extends BaseModal {

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


  @Column({ type: "timestamp", nullable: true })
  dateEvent: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages, { nullable: true, cascade: false })
  chat: Chat;

}

