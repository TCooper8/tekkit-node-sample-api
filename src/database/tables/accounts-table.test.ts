import { DataSource } from "typeorm";
import { initDatabase } from "../init-database";
import { AccountsTable } from "./accounts-table";
import { expect } from "chai";
import { faker } from '@faker-js/faker';
import { AccountPermissionsTable } from "./account-permissions-table";
import { AccountEntity } from "./entities/account-entity";

describe('accounts-table', () => {
  let datasource: DataSource;
  let accountsTable: AccountsTable;

  before(async () => {
    datasource = await initDatabase(0);
    accountsTable = new AccountsTable(datasource);
  });

  it('Should insert a row.', async () => {
    const input = {
      email: faker.internet.email(),
    }
    const account = await accountsTable.insert(input);
    expect(account).to.deep.equal({
      ...account,
      ...input,
    });
  });

  it('Should select a row after creation.', async () => {
    const account = await accountsTable.insert({
      email: faker.internet.email(),
    });
    const selected = await accountsTable.select().whereId(account.id).one();

    // Testing that the account inserted can be selected by id.
    expect(account).to.deep.equal(selected);

    // Test against other rows being selected.
    await accountsTable.insert({
      email: faker.internet.email(),
    });
    await accountsTable.insert({
      email: faker.internet.email(),
    });

    // Flipping sorting order to ensure no other results are fetched.
    expect(
      await accountsTable.select().whereId(account.id).orderByCreatedAt('DESC').one()
    ).to.not.equal(account.id);
    expect(
      await accountsTable.select().whereId(account.id).orderByCreatedAt('ASC').one()
    ).to.not.equal(account.id);
  });
});

describe('accounts-table permissions', () => {
  let datasource: DataSource;
  let accountsTable: AccountsTable;
  let accountPermissionsTable: AccountPermissionsTable;

  const subject = faker.string.uuid();
  const accessLevels = [
    // Using uuids to ensure there is no conflict with existing data.
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ];

  let account: AccountEntity;

  before(async () => {
    datasource = await initDatabase(0);
    accountsTable = new AccountsTable(datasource);
    accountPermissionsTable = new AccountPermissionsTable(datasource);
  });

  it('Should create an account with permissions.', async () => {
    account = await datasource.transaction(async tx => {
      const account = await accountsTable.insert({ email: faker.internet.email() }, tx);

      await accountPermissionsTable.insertMany(
        accessLevels.map(accessLevel => {
          return {
            accountId: account.id,
            subject,
            accessLevel,
          };
        }),
        tx,
      );

      return account;
    });
    // NOTE: Not testing that permissions inserted correctly because that should be tested elsewhere.
  });

  it('Should select accounts for the given subject.', async () => {
    const accounts = await accountsTable.select()
      .wherePermissionSubject(subject)
      .many();

    console.log(accounts);
    expect(accounts).to.have.length(1);
    expect(accounts[0]).to.deep.equal(account);
  });

  it('Should select accounts for the inserted access levels.', async () => {
    // Select by access level in array.
    const accounts = await accountsTable.select()
      .wherePermissionSubject(subject)
      .wherePermissionAccessLevelIn(accessLevels)
      .many();

    expect(accounts).to.have.length(1);
    expect(accounts[0]).to.deep.equal(account);

    // Select by single access levels.
    for (const accessLevel of accessLevels) {
      const accounts = await accountsTable.select()
        .wherePermissionSubject(subject)
        .wherePermissionAccessLevel(accessLevel)
        .many();

      expect(accounts).to.have.length(1);
      expect(accounts[0]).to.deep.equal(account);
    }
  });
});