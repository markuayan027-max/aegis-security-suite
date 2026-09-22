// ─────────────────────────────────────────────────────────────────────────────
// Created: 2026-09-17 | Purpose: Vercel Serverless Function entry point for E-Secure 1.0
// Last verified with: Vercel CLI 54.14+ | Node.js 20+
// Compatible with OpenCode plugin: paste this into prompt
// ─────────────────────────────────────────────────────────────────────────────

import { requestHandler } from '../server.js';

export default async function handler(req, res) {
  return requestHandler(req, res);
}
