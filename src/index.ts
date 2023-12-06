import { initDatabase } from './database/init-database';
import { AccountPermissionsTable } from './database/tables/account-permissions-table';
import { AccountsTable } from './database/tables/accounts-table';
import env from './env';
import { AccountService } from './services/account-service';
import { AuthService } from './services/auth-service';
import { WebServer } from './web';

const main = async () => {
  const datasource = await initDatabase(5);

  // Set up tables.
  const tables = {
    accounts: new AccountsTable(datasource),
    accountPermissions: new AccountPermissionsTable(datasource),
  }

  // Set up services.
  const services = {
    authService: new AuthService(),
    accountService: new AccountService(
      datasource, 
      tables.accounts,
      tables.accountPermissions,
    ),
  };

  // Some demo event listeners.
  const eventListeners = [
    services.accountService.onCreated.listen(async account => {
      console.log('event | account-created:%s', account.id);
    }),
  ];

  // Set up web server.
  const server = new WebServer(Number.parseInt(env.get('PORT', '80')), services);
  const _server = await server.start();

  const cleanup = () => {
    eventListeners.forEach(f => f()); // Close all of the events listeners.
    console.log('Closed event listeners.');
  }

  process.on('SIGINT', () => {
    _server.close();
  });

  process.on('exit', code => {
    _server.close();
  });

  await new Promise((done, fail) => {
    _server.on('error', fail);
    _server.on('close', () => {
      cleanup();
      console.log('Closing webserver');
    });
  });
}

main().catch(err => {
  console.log('setup-error:%j', err);
  process.exit(1);
});