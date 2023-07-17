import { Column, PrimaryGeneratedColumn } from "typeorm"

export abstract class BaseModal {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: false })
  deletado: boolean;


  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  dateCreation: Date

  @Column({ nullable: true, type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  dateModification: Date

}