import { IMiddleware } from "koa-router";
import { AuthService } from "../../services/auth-service";

export const AuthMiddleware = ({
  authService,
}: {
  authService: AuthService;
}): IMiddleware => {
  return async (ctx, next) => {
    const auth = await authService.authorize(ctx.get('authorization'));
    ctx.state.auth = auth;
    return await next();
  }
}