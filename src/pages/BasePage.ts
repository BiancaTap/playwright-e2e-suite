import type { Locator, Page, Response } from '@playwright/test';
import { expect } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;
  protected abstract readonly readySelector: string;

  constructor(protected readonly page: Page) {}

  async goto(opts: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' } = {}): Promise<void> {
    const waitUntil = opts.waitUntil ?? 'domcontentloaded';
    // The live target intermittently refuses a connection or serves a slow/empty
    // first response under load — the navigation throws (e.g. NS_ERROR_NET_ERROR_
    // RESPONSE) or the ready element never appears. Retry the whole navigation
    // a couple of times before failing. This recovers from a transient blip
    // rather than masking a real defect, which would still fail every attempt.
    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await this.page.goto(this.path, { waitUntil });
        await this.waitForReady();
        return;
      } catch (err) {
        if (attempt === attempts) throw err;
      }
    }
  }

  async waitForReady(): Promise<void> {
    await expect(this.page.locator(this.readySelector).first()).toBeVisible({ timeout: 15_000 });
  }

  get header(): Locator {
    return this.page.locator('#header');
  }

  get footer(): Locator {
    return this.page.locator('#footer');
  }

  get loggedInBadge(): Locator {
    return this.page.locator('a:has-text("Logged in as")');
  }

  get logoutLink(): Locator {
    return this.page.getByRole('link', { name: /logout/i });
  }

  async isLoggedIn(): Promise<boolean> {
    return this.loggedInBadge.isVisible().catch(() => false);
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.page.waitForURL(/\/login/);
  }

  /**
   * Wait for a network response matching a predicate. Replacement for the
   * waitForTimeout antipattern when an action triggers an async request whose
   * effect is otherwise invisible to web-first assertions.
   */
  async waitForResponseTo(
    urlSubstring: string,
    action: () => Promise<unknown>,
  ): Promise<Response> {
    const [resp] = await Promise.all([
      this.page.waitForResponse((r) => r.url().includes(urlSubstring), { timeout: 20_000 }),
      action(),
    ]);
    return resp;
  }
}
