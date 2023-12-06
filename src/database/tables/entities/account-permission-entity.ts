import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity('account_permissions')
export class AccountPermissionEntity extends BaseEntity {
  // Not actually a primary column. This is a limitation from typeorm that an entity must have a primary column.
  @PrimaryColumn('uuid')
  accountId: string;

  @Column('timestamptz')
  createdAt: Date;

  @Column('text')
  subject: string;

  @Column('text')
  accessLevel: string;
}