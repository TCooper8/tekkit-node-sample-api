import Router from "koa-router";
import { AccountInput, AccountService } from "../../services/account-service";
import Ajv from 'ajv';
import { BadRequestError } from "../../errors";

/**
 * Creates a router to handle CRUD operations for accounts.
 */
export const AccountsRouter = ({
  accountService,
}: {
  accountService: AccountService;
}) => {
  // Create the router and set up the routes.
  const router = new Router();

  router.post('/api/v1/accounts', async ctx => {
    await ctx.state.auth.assert(); // NOTE: Awaiting this even though it isn't a promise, just in case someone ever makes it a promise, to ensure it doesn't get ignored.

    const auth = ctx.state.auth; // Grabbing auth state. This should come from middleware.
    const input = ctx.request.body; // NOTE: This will be an arbitrary object, no validation has taken place.

    // Validate the inputs. We don't want to validate types beyond the presentation layer. Also, we don't want any business logic here.
    const validator = new Ajv().compile({
      type: 'object',
      properties: {
        email: {
          type: 'string'
        },
      },
      required: [ 'email' ],
      additionalProperties: false,
    });
    if (!validator(input)) {
      throw new BadRequestError(validator.errors);
    }

    // Create the account record and return the result.
    const account = await accountService.create(auth, input as AccountInput);

    ctx.status = 201;
    ctx.body = account;
  });

  router.get('/api/v1/accounts', async ctx => {
    await ctx.state.auth.assert();

    const auth = ctx.state.auth;
    const queryParams = ctx.request.query;

    const rows = await accountService.find(auth, queryParams);
    const total = await accountService.total(auth, queryParams);

    return {
      rows,
      total,
    }
  });

  return router;
}