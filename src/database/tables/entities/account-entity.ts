import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity('accounts')
export class AccountEntity extends BaseEntity {
  @PrimaryColumn({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  id: string;

  @Column('timestamptz')
  createdAt: Date;

  @Column('timestamptz')
  updatedAt: Date;

  @Column('timestamptz')
  deletedAt: Date | null;

  @Column('text')
  email: string;
}