/**
 * YQL Platform — Design System
 *
 * One import for everything:
 *
 *   import { Button, Card, Input, tokens } from '@/design';
 *   import type { ColorToken, RadiusToken } from '@/design';
 */

// ── Design tokens ─────────────────────────────────────────────────────────────
export * as tokens from './tokens';
export type { ColorToken, RadiusToken, ShadowToken } from './tokens';

// ── UI components ─────────────────────────────────────────────────────────────
export * from '../core/components/ui';
