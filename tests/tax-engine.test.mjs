// Runs the known-answer suite in lib/tax/taxEngine2026.test.ts under
// `node --test`. That file registers one node:test case per check(); it
// imports "./taxEngine2026" without an extension, so register the same
// `.ts`-appending resolver the ads tests use.
import { register } from 'node:module';

register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        try {
          return await next(specifier, context);
        } catch (err) {
          if (err && err.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\\.[a-z]+$/i.test(specifier)) {
            return next(specifier + '.ts', context);
          }
          throw err;
        }
      }
    `),
);

await import('../lib/tax/taxEngine2026.test.ts');
