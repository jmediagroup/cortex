import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

/**
 * The one way an API route should answer an unexpected failure.
 *
 * The person gets a plain sentence and a short reference code. The real error
 * (database message, stack trace, provider status) goes to the server log
 * under that same code, so a support email quoting "ref a1b2c3d4" can be
 * matched to the log line, and no internals ever reach the browser.
 *
 *   } catch (err) {
 *     return internalErrorResponse('scenarios:list', err);
 *   }
 */
export function internalErrorResponse(
  context: string,
  err: unknown,
  message = 'Something went wrong on our side. Please try again in a moment.',
  status = 500,
): NextResponse {
  const ref = randomBytes(4).toString('hex');
  const detail =
    err instanceof Error
      ? `${err.name}: ${err.message}`
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : String(err);
  console.error(`[${context}] ref=${ref} ${detail}`, err instanceof Error && err.stack ? `\n${err.stack}` : '');
  return NextResponse.json({ error: message, ref }, { status });
}
