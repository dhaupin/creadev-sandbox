/**
 * @creadev.org/sandbox
 *
 * Execution isolation layer - gating, limiting behavior.
 *
 * EXAMPLES:
 * ```typescript
 * import { Sandbox } from '@creadev.org/sandbox';
 *
 * const s = new Sandbox({ maxConcurrent: 3, agentId: 'agent-1' });
 * ```
 * ============================================================================
 */

import { Bulkhead, createBulkhead } from '@creadev.org/qos/bulkhead';
import type { BulkheadOptions } from '@creadev.org/qos/bulkhead';

// ============================================================================
// CONFIG
// ============================================================================

export interface SandboxOptions {
  /** Max concurrent operations (default: 3) */
  maxConcurrent?: number;
  /** Agent ID for isolation (default: 'default') */
  agentId?: string;
  /** Read quota per minute (default: 100) */
  readQuota?: number;
  /** Write quota per minute (default: 50) */
  writeQuota?: number;
  /** Require lock for writes (default: false) */
  requireLock?: boolean;
}

// ============================================================================
// SANDBOX
// ============================================================================

export class Sandbox {
  private options: Required<SandboxOptions>;
  private bulkhead: Bulkhead;
  private readCount: number;
  private writeCount: number;
  private startTime: number;

  constructor(options: SandboxOptions = {}) {
    this.options = {
      maxConcurrent: options.maxConcurrent ?? 3,
      agentId: options.agentId ?? 'default',
      readQuota: options.readQuota ?? 100,
      writeQuota: options.writeQuota ?? 50,
      requireLock: options.requireLock ?? false,
    };

    this.bulkhead = createBulkhead({ concurrency: this.options.maxConcurrent });
    this.readCount = 0;
    this.writeCount = 0;
    this.startTime = Date.now();
  }

  // ---------------------------------------------------------------------------
  // CAPABILITIES
  // ---------------------------------------------------------------------------

  /** Check if can read */
  canRead(): boolean {
    return this.readCount < this.options.readQuota;
  }

  /** Check if can write */
  canWrite(): boolean {
    return this.writeCount < this.options.writeQuota;
  }

  // ---------------------------------------------------------------------------
  // EXECUTE
  // ---------------------------------------------------------------------------

  /** Execute read operation */
  async read<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canRead()) {
      throw new Error('Read quota exceeded');
    }
    
    this.readCount++;
    return this.bulkhead.run(fn);
  }

  /** Execute write operation */
  async write<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canWrite()) {
      throw new Error('Write quota exceeded');
    }
    
    this.writeCount++;
    return this.bulkhead.run(fn);
  }

  // ---------------------------------------------------------------------------
  // RESET
  // ---------------------------------------------------------------------------

  /** Reset counters */
  reset(): void {
    this.readCount = 0;
    this.writeCount = 0;
  }

  // ---------------------------------------------------------------------------
  // STATUS
  // ---------------------------------------------------------------------------

  getStatus() {
    return {
      agentId: this.options.agentId,
      readCount: this.readCount,
      writeCount: this.writeCount,
      readQuota: this.options.readQuota,
      writeQuota: this.options.writeQuota,
      maxConcurrent: this.options.maxConcurrent,
      uptime: Date.now() - this.startTime,
    };
  }
}