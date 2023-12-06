import { DataSource, EntityManager, Equal, Not, QueryFailedError, SelectQueryBuilder } from "typeorm";
import { AccountEntity } from "./entities/account-entity";
import { constants } from "../../constants";
import { ConflictError } from "../../errors";

const accountAlias = 'account';

export class AccountsQuery {
  private permissionsJoined: boolean = false;

  constructor (private stmt: SelectQueryBuilder<AccountEntity>) { }

  /**
   * Used to initialize an AccountsQuery in a default way.
   */
  static init = (datasource: DataSource) => {
    return new AccountsQuery(
      datasource
        .createQueryBuilder(AccountEntity, accountAlias)
        .orderBy('account.created_at', 'DESC')
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
  many = async () => this.stmt.getMany()

  /**
   * Method to count the total number of records for this query.
   */
  count = async () => this.stmt.getCount();

  limit = (limit?: number) => {
    if (!limit) return this;

    this.stmt = this.stmt.limit(limit);
    return this;
  }

  private joinPermissions = () => {
    if (this.permissionsJoined) return this;

    this.stmt = this.stmt.innerJoin('account_permissions', 'permission', 'permission.account_id = account.id');
    this.permissionsJoined = true;
    return this;
  }

  excludeDeleted = () => {
    this.stmt = this.stmt.andWhere('account.deleted_at is null');
    return this;
  }

  wherePermissionSubject = (subject?: string) => {
    if (!subject) return this;

    this.joinPermissions();
    this.stmt = this.stmt.andWhere('permission.subject = :subject', { subject });
    return this;
  }

  wherePermissionAccessLevel = (accessLevel?: string) => {
    if (!accessLevel) return this;

    this.joinPermissions();
    this.stmt = this.stmt.andWhere('permission.access_level = :accessLevel', { accessLevel });
    return this;
  }

  wherePermissionAccessLevelIn = (accessLevels?: string[]) => {
    if (!accessLevels) return this;

    this.joinPermissions();
    this.stmt = this.stmt.andWhere('permission.access_level in (:...accessLevels)', { accessLevels });
    return this;
  }

  /**
   * Method to add select clause where id matches `id` param. If `id` is undefined then no clause is added.
   */
  whereId = (id?: string) => {
    if (!id) return this;

    this.stmt = this.stmt.andWhere({
      id: Equal(id),
     });
    return this;
  }

  orderByCreatedAt = (direction: "DESC" | "ASC" | undefined='DESC') => {
    return new AccountsQuery(
      this.stmt.orderBy('"account".created_at', direction)
    );
  }
}

/**
 * Table class for "accounts" table in database.
 */
export class AccountsTable {
  constructor(
    private datasource: DataSource,
  ) { }

  private onError = async (err: Error) => {
    if (err instanceof QueryFailedError) {
      if (err.driverError.constraint === 'accounts_email_key') {
        throw new ConflictError('email');
      }
    }
    return Promise.reject(err);
  }

  /**
   * Method to create a row in the accounts table.
   */
  insert = async (values: Partial<AccountEntity>, manager?: EntityManager): Promise<AccountEntity> => {
    const res = await (manager || this.datasource).createQueryBuilder(AccountEntity, accountAlias /* Alias does nothing here. */)
      .insert()
      .values(values)
      .returning('*')
      .execute()
      .catch(this.onError);
    return res.generatedMaps[0] as AccountEntity;
  }
  
  /**
   * Method to create a query object for accounts.
   */
  select = () => AccountsQuery.init(this.datasource);
}