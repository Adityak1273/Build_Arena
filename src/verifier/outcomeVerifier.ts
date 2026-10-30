import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ActionResult } from '../runtime/browserController';

export interface BrowserVerificationResult {
  verified: boolean;
  urlMatch: boolean;
  keywordsFound: string[];
  missingKeywords: string[];
  flaggedUnknowns: string[];
  executionTimeMs: number;
  actualUrl: string;
  title: string;
}

export interface SpreadsheetVerificationResult {
  verified: boolean;
  diskIntegrityVerified: boolean;
  filePath: string;
  fileSizeBytes: number;
  diskHashSha256: string;
  totalRows: number;
  expectedMinRows: number;
  columnsPresent: string[];
  missingColumns: string[];
  flaggedUnknowns: string[];
  validRowCount: number;
  timestamp: string;
}

export class OutcomeVerifier {
  public static verifyBrowserState(
    result: ActionResult,
    expectedUrlSubstring?: string,
    requiredKeywords: string[] = []
  ): BrowserVerificationResult {
    const actualUrl = result.url || '';
    const title = result.title || '';
    const textPool = `${actualUrl} ${title} ${result.domExcerpt || ''} ${result.extractedText || ''}`.toLowerCase();

    let urlMatch = true;
    if (expectedUrlSubstring) {
      urlMatch = actualUrl.toLowerCase().includes(expectedUrlSubstring.toLowerCase());
    }

    const keywordsFound: string[] = [];
    const missingKeywords: string[] = [];
    const flaggedUnknowns: string[] = [];

    for (const kw of requiredKeywords) {
      if (textPool.includes(kw.toLowerCase())) {
        keywordsFound.push(kw);
      } else {
        missingKeywords.push(kw);
        flaggedUnknowns.push(`Missing keyword '${kw}' in live page state`);
      }
    }

    if (!urlMatch && expectedUrlSubstring) {
      flaggedUnknowns.push(`URL '${actualUrl}' does not match expected substring '${expectedUrlSubstring}'`);
    }

    if (!result.success) {
      flaggedUnknowns.push(`Browser action execution failed: ${result.error || 'Unknown error'}`);
    }

    const verified = urlMatch && missingKeywords.length === 0 && result.success;

    return {
      verified,
      urlMatch,
      keywordsFound,
      missingKeywords,
      flaggedUnknowns,
      executionTimeMs: result.executionTimeMs,
      actualUrl,
      title
    };
  }

  public static verifySpreadsheetArtifact(
    filePath: string,
    expectedMinRows: number = 10,
    requiredColumns: string[] = [
      'startupName',
      'coreProduct',
      'pricingTiers',
      'freeTrialAvailable',
      'sourceUrl',
      'flaggedUnknowns'
    ]
  ): SpreadsheetVerificationResult {
    const timestamp = new Date().toISOString();
    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      return {
        verified: false,
        diskIntegrityVerified: false,
        filePath: resolvedPath,
        fileSizeBytes: 0,
        diskHashSha256: '',
        totalRows: 0,
        expectedMinRows,
        columnsPresent: [],
        missingColumns: requiredColumns,
        flaggedUnknowns: [`Artifact file not found at: ${resolvedPath}`],
        validRowCount: 0,
        timestamp
      };
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileSizeBytes = fileBuffer.length;
    const diskHashSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const content = fileBuffer.toString('utf-8');

    let rows: Record<string, string>[] = [];
    let headers: string[] = [];

    if (resolvedPath.endsWith('.json')) {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          rows = parsed;
        } else if (parsed.rows && Array.isArray(parsed.rows)) {
          rows = parsed.rows;
        }
        if (rows.length > 0) {
          headers = Object.keys(rows[0]);
        }
      } catch (err: any) {
        return {
          verified: false,
          diskIntegrityVerified: false,
          filePath: resolvedPath,
          fileSizeBytes,
          diskHashSha256,
          totalRows: 0,
          expectedMinRows,
          columnsPresent: [],
          missingColumns: requiredColumns,
          flaggedUnknowns: [`JSON parse failure: ${err.message}`],
          validRowCount: 0,
          timestamp
        };
      }
    } else {
      // CSV parsing
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(',').map((c) => c.replace(/^["']|["']$/g, '').trim());
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cells[idx] || '';
          });
          rows.push(rowObj);
        }
      }
    }

    // Standardize column name matching (allowing snake_case or camelCase)
    const normalizedHeaders = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const missingColumns: string[] = [];
    const columnsPresent: string[] = [];

    for (const reqCol of requiredColumns) {
      const normReq = reqCol.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = normalizedHeaders.some(
        (nh) =>
          nh === normReq ||
          (normReq.includes('name') && nh.includes('name')) ||
          (normReq.includes('pricing') && nh.includes('pricing')) ||
          (normReq.includes('url') && (nh.includes('url') || nh.includes('domain')))
      );

      if (match) {
        columnsPresent.push(reqCol);
      } else {
        missingColumns.push(reqCol);
      }
    }

    const flaggedUnknowns: string[] = [];
    let validRowCount = 0;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      let rowValid = true;

      for (const [key, val] of Object.entries(row)) {
        const strVal = String(val).trim();
        if (!strVal || strVal.toLowerCase() === 'null' || strVal.toLowerCase() === 'undefined') {
          flaggedUnknowns.push(`Row ${rIdx + 1}: Empty value for '${key}'`);
          rowValid = false;
        } else if (
          strVal.toUpperCase().includes('UNKNOWN') ||
          strVal.toUpperCase().includes('CONTACT SALES') ||
          strVal.toUpperCase().includes('ENTERPRISE')
        ) {
          flaggedUnknowns.push(`Row ${rIdx + 1} (${row.company_name || row.startupName || 'Startup'}): ${key} = ${strVal}`);
        }
      }

      if (rowValid) {
        validRowCount++;
      }
    }

    if (rows.length < expectedMinRows) {
      flaggedUnknowns.push(`Total rows (${rows.length}) is below required minimum (${expectedMinRows})`);
    }

    const diskIntegrityVerified = fileSizeBytes > 0 && diskHashSha256.length === 64;
    const verified =
      diskIntegrityVerified &&
      rows.length >= expectedMinRows &&
      missingColumns.length === 0;

    return {
      verified,
      diskIntegrityVerified,
      filePath: resolvedPath,
      fileSizeBytes,
      diskHashSha256,
      totalRows: rows.length,
      expectedMinRows,
      columnsPresent,
      missingColumns,
      flaggedUnknowns,
      validRowCount,
      timestamp
    };
  }
}
