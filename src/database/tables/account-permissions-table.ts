import { DataSource, EntityManager, SelectQueryBuilder } from "typeorm";
import { constants } from "../../constants";
import { AccountPermissionEntity } from "./entities/account-permission-entity";

const accountPermissionAlias = 'account_permission';

export class AccountPermissionsQuery {
  constructor (private stmt: SelectQueryBuilder<AccountPermissionEntity>) { }

  /**
   * Used to initialize an AccountsQuery in a default way.
   */
  static init = (datasource: DataSource) => {
    return new AccountPermissionsQuery(
      datasource
        .createQueryBuilder(AccountPermissionEntity, accountPermissionAlias)
        .orderBy('account_permission.created_at', 'DESC')
        .limit(constants.defaultLimit)
    );
  }

  /**
   * Method to query for a single record.
   */
  one = async () => this.stmt.getOne();

  /**
   * Method to query for many records.
  */
  many = async () => this.stmt.getMany();

  /**
   * Method to add select clause where id matches `id` param. If `id` is undefined then no clause is added.
   */
  whereId = (id?: string) => {
    if (!id) return this;

    return new AccountPermissionsQuery(
      this.stmt.andWhere('account.id = :id', { id })
    );
  }
}

/**
 * Table class for "accounts" table in database.
 */
export class AccountPermissionsTable {
  constructor(
    private datasource: DataSource,
  ) { }

  /**
   * Method to create a row in the accounts table.
   */
  insertMany = async (values: Partial<AccountPermissionEntity>[], manager?: EntityManager): Promise<AccountPermissionEntity[]> => {
    const res = await (manager || this.datasource).createQueryBuilder()
      .insert()
      .into(AccountPermissionEntity)
      .values(values)
      .returning('*')
      .execute();
    return res.generatedMaps as AccountPermissionEntity[];
  }
  
  /**
   * Method to create a query object for accounts.
   */
  select = () => AccountPermissionsQuery.init(this.datasource);
}