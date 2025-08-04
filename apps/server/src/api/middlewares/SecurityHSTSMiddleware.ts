/**
 * @fileoverview Middleware responsible for securing HTTP headers using Helmet.
 * Explicitly configures and enforces HTTP Strict Transport Security (HSTS) to ensure secure connections over HTTPS.
 * Applies long-term maxAge, subdomain inclusion, and prepares for preload if desired in the future.
 * @author Lucas
 * @license MIT
 */

import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import helmet from 'helmet';

@Middleware({ type: 'before' })
@Service()
export default class SecurityHSTSMiddleware implements ExpressMiddlewareInterface {
    private readonly secure = helmet({
        hsts: {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            includeSubDomains: true
        }
    });

    use = this.secure;
}