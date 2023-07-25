import { Column, Entity, ManyToOne } from "typeorm";
import { BaseModal } from "./base-model";
import { MessageIntegration } from "./message-integration";


@Entity('media-message-integration')
export class MediaMessageIntegration extends BaseModal {

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  path: string;

  @Column({ type: 'numeric', nullable: true })
  size: number;

  @ManyToOne(() => MessageIntegration, (mI) => mI.medias, { nullable: true, cascade: false })
  message: MessageIntegration;

}