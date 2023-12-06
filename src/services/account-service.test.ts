import { expect } from "chai";
import { AppError, ErrorCode, UnauthorizedError } from "../errors";
import { Account, AccountAccessLevel, AccountService } from "./account-service";
import { Auth } from "./auth-service";
import { DataSource } from "typeorm";
import { AccountsTable } from "../database/tables/accounts-table";
import { AccountPermissionsTable } from "../database/tables/account-permissions-table";
import { faker } from "@faker-js/faker";

describe('account-service', () => {
  it('Should verify auth subject on create.', async () => {
    const accountService = new AccountService(null as any, null as any, null as any); // NOTE: casting values because methods should not be called during this test.

    // Error trap used to ensure specific function throws the error, not a similar error.
    const errorTrap = new Error();
    const auth = {
      assertSubject: () => { throw errorTrap; return null },
    } as Auth;

    const input = {} as any;
    const err = await accountService.create(auth, input as any) // NOTE: Input has a cast because it shouldn't be used until auth is verified.
      .catch(err => err);

    // If it is not the error that is thrown specifically from the auth object, then something might be incorrect.
    expect(err).to.be.instanceof(Error);
    expect(err).to.be.equal(errorTrap, 'Incorrect error thrown');
  });
  
  it('Should use a transaction from datasource.', async () => {
    // More complicated test because it involves multiple classes interacting with data.

    // Create a mock transaction connection to be used.
    // NOTE: We need to ensure that this connection is specifically used when calling tables.
    const tx = {};

    // Mock objects to test against.
    const subject = faker.string.uuid();
    const auth = new Auth(subject); 
    const expectedAccount = {
      id: faker.string.uuid(),
    };
    const _expectedAccount = { ...expectedAccount }; // Second object to check against any changes to the original.

    const expectedPermissions =
      [
        AccountAccessLevel.Read,
        AccountAccessLevel.Write,
      ].map(accessLevel => {
        return {
          accessLevel,
          subject,
          accountId: expectedAccount.id,
        };
      });

    const accountService = new AccountService(
      {
        transaction: async binding => {
          return await binding(tx);
        },
      } as DataSource,
      {
        insert: async (values, source) => {
          expect(source).to.equal(tx);
          return expectedAccount; // This value is what should be returned by the `insert` method of the account service.
        },
      } as AccountsTable,
      {
        insertMany: async (values, source) => {
          expect(source).to.equal(tx);
          // Assert that the correct values are being used.
          expect(values).to.deep.equal(expectedPermissions);
          return expectedPermissions;
        },
      } as AccountPermissionsTable,
    ); 

    const input = { email: faker.internet.email() };
    const account = await accountService.create(auth, input);

    expect(account).to.equal(expectedAccount, 'Reference does not match'); // Not a deep equal, a reference equal.
    expect(account).to.deep.equal(_expectedAccount, 'Table result should not be manipulated'); // Deep equal to check against unexpected changes. 
  });

  it('Should emit created event upon account creation.', async () => {
    // More complicated test because it involves multiple classes interacting with data.

    // Create a mock transaction connection to be used.
    // NOTE: We need to ensure that this connection is specifically used when calling tables.
    const tx = {};

    // Mock objects to test against.
    const subject = faker.string.uuid();
    const auth = new Auth(subject); 
    const expectedAccount = {} as Account; // Used for a reference check.

    const accountService = new AccountService(
      {
        transaction: async binding => expectedAccount,
      } as DataSource,
      // Table calls don't need to be tested since they are within the transaction.
      null,
      null,
    ); 

    const future = (() => {
      let resolve: (input) => Promise<void> = null;
      const promise = new Promise((_resolve, reject) => {
        resolve = _resolve as any;
        setTimeout(() => reject('event-timeout'), 100);
      });

      return {
        resolve,
        promise,
      };
    })();

    // Create the listener for the event.
    accountService.onCreated.listen(future.resolve);

    // NOTE: We are not testing the inputs or the output. We are testing that the event gets emitted.
    await accountService.create(auth, {} as any); // We are not testing the inputs in this test.

    const emittedValue = await future.promise;
    expect(emittedValue).to.equal(expectedAccount, 'Reference does not match'); // Not a deep equal, a reference equal.
  });
});