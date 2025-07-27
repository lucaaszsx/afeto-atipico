/**
 * @fileoverview Middleware responsible for securing HTTP headers using Helmet.
 * Applies several middleware protections such as content security policy, XSS filtering, and clickjacking prevention.
 * @author Lucas
 * @license MIT
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import helmet from 'helmet';

@Middleware({ type: 'before' })
@Service()
export default class SecurityMiddleware implements ExpressMiddlewareInterface {
    private readonly secure = helmet();

    use = this.secure;
}
