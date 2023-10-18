import { Context, Middleware, NextFunction } from 'grammy';

export interface IsAdminConfig {
    adminUsername: string;
    isAdmin: boolean;
}
export type IsAdminContext = {
    config: IsAdminConfig;
};

export function isAdmin(adminUsername: string): Middleware<Context & IsAdminContext> {
    return async (ctx: Context & IsAdminContext, next: NextFunction): Promise<void> => {
        ctx.config = {
            adminUsername: adminUsername,
            isAdmin: ctx.from?.username === adminUsername
        };

        await next();
    };
}
