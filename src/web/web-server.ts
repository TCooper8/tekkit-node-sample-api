import koa from 'koa';
import Router from 'koa-router';
import BodyParser from 'koa-bodyparser';
import { AccountsRouter } from './routers/accounts-router';
import { AccountService } from '../services/account-service';
import { ErrorMiddleware } from './middleware/error-middleware';
import { AuthMiddleware } from './middleware/auth-middleware';
import { AuthService } from '../services/auth-service';

// HTTP server for this project.
export class WebServer {
  constructor(
    private port: number=80,
    private services: {
      authService: AuthService;
      accountService: AccountService;
    },
  ) { }

  start = () => {
    const app = new koa();
    const router = new Router();
    
    // Set up middleware.
    app.use(BodyParser())
    app.use(ErrorMiddleware());
    app.use(AuthMiddleware(this.services));

    // Set up routers.
    router.use(AccountsRouter(this.services).routes());

    app.use(router.routes());
    return app.listen(this.port, () => {
      console.log('Listening on port:%d', this.port);
    });
  }
}