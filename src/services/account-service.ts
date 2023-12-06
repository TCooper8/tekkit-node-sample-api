import { DataSource } from "typeorm";
import { AccountPermissionsTable } from "../database/tables/account-permissions-table";
import { AccountsTable } from "../database/tables/accounts-table";
import { AsyncDelegate } from "../eventing/async-delegate";
import { Auth } from "./auth-service";

export enum AccountAccessLevel {
  Read = 'read',
  Write = 'write',
}

export type AccountPermission = {
  accountId: string;
  subject: string;
  accessLevel: AccountAccessLevel;
}

export type AccountInput = {
  email: string;
}

export type Account = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type AccountPage = {
  rows: Account[];
  total?: number;
}

export enum AccountOrderBy {
  CreatedAt = 'createdAt',
  CreatedAtDesc = 'createdAt:desc',
  CreatedAtAsc = 'createdAt:asc',
}

export type AccountQueryParams = {
  limit?: number;
  orderBy?: string;
  createdBefore?: string;
  total?: boolean;
}

export class AccountService {
  // For dependents to listen for account created events.
  onCreated = new AsyncDelegate<Account>();

  constructor(
    private datasource: DataSource,
    private accountsTable: AccountsTable,
    private accountPermissionsTable: AccountPermissionsTable,
  ) { }

  /**
   * Create an account record with permissions.
   */
  create = async (auth: Auth, input: AccountInput): Promise<Account> => {
    // Auth checks.
    const subject = auth.assertSubject(); // Grab the subject of the authorization.

    // NOTE: Business specific input validation should be done here.

    // Use of a transaction will ensure that all records are created upon success, and that nothing is created upon failure.
    const account = await this.datasource.transaction(async tx => {
      const account = await this.accountsTable.insert(input, tx);
      await this.accountPermissionsTable.insertMany(
        // Create default permissions for account creator.
        [
          AccountAccessLevel.Read,
          AccountAccessLevel.Write,
        ].map(accessLevel => {
          return {
            accessLevel,
            subject,
            accountId: account.id,
          }
        }),
        tx, // NOTE: Must use connection for transaction.
      );

      return account;
    });

    // NOTE: Decision to await listeners before returning the result is arbitrary.
    await this.onCreated.emit(account);

    // Audit log.
    console.log('subject:%s created account:%s', subject, account.id);

    return account;
  }

  private queryFrom = (auth: Auth, queryParams: AccountQueryParams={}) => {
    // Auth checks.
    const subject = auth.assertSubject();

    let query =
      this.accountsTable.select()
      .limit(queryParams.limit)
      .whereCreatedBefore(queryParams.createdBefore)
      // Ensure that permissions are being respected.
      .wherePermissionSubject(subject)
      .wherePermissionAccessLevel(AccountAccessLevel.Read);

    switch (queryParams.orderBy) {
      case AccountOrderBy.CreatedAt:
      case AccountOrderBy.CreatedAtDesc:
        query = query.orderByCreatedAt('DESC'); break;

      case AccountOrderBy.CreatedAtAsc:
        query = query.orderByCreatedAt('ASC'); break;
    }

    return query;
  }

  find = async (auth: Auth, queryParams: AccountQueryParams={}): Promise<AccountPage> => {
    const query = this.queryFrom(auth, queryParams);

    if (queryParams.total) {
      return {
        rows: await query.many(),
        total: await query.count(),
      }
    }

    return {
      rows: await query.many(),
    }
  }

  total = async (auth: Auth, queryParams: AccountQueryParams={}): Promise<number> => {
    return await this.queryFrom(auth, queryParams).count();
  }
}