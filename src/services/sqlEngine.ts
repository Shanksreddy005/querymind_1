import alasql from 'alasql';
import { Dataset } from '../types';

export interface ExecutionOutput {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  sanitizedSql: string;
}

/**
 * Registers a dataset as an in-memory SQL table in alasql.
 * Sets up primary table name as well as standard alias 'dataset'.
 */
export function registerDatasetInSql(dataset: Dataset): void {
  try {
    const tableName = dataset.tableName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    
    // Clear previous definitions
    try {
      alasql(`DROP TABLE IF EXISTS ${tableName}`);
      alasql(`DROP TABLE IF EXISTS dataset`);
    } catch {
      // Ignore if table didn't exist
    }

    // Register active table
    alasql(`CREATE TABLE ${tableName}`);
    alasql.tables[tableName].data = dataset.data;

    // Also register standard alias 'dataset' for easy generic querying
    alasql(`CREATE TABLE dataset`);
    alasql.tables['dataset'].data = dataset.data;
  } catch (err: any) {
    console.error('Failed to register dataset in in-memory SQL engine:', err);
  }
}

/**
 * Sanitizes and cleans AI-generated SQL query before in-memory execution.
 */
export function cleanSql(rawSql: string, activeTableName?: string): string {
  let sql = rawSql.trim();
  
  // Remove markdown code fences if any
  sql = sql.replace(/```sql/gi, '').replace(/```/g, '').trim();

  // Remove trailing semicolons for consistency
  sql = sql.replace(/;+$/, '').trim();

  // If table name is referenced with quotes, normalize it
  if (activeTableName) {
    const sanitizedName = activeTableName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    // Replace markdown or case variations
    sql = sql.replace(new RegExp(`"${activeTableName}"`, 'gi'), sanitizedName);
    sql = sql.replace(new RegExp(`\`${activeTableName}\``, 'gi'), sanitizedName);
  }

  return sql;
}

/**
 * Executes a SELECT query safely in-memory using Alasql.
 */
export function executeClientSql(sql: string, dataset?: Dataset): ExecutionOutput {
  const startTime = performance.now();
  const sanitizedSql = cleanSql(sql, dataset?.tableName);

  // Safety check: only allow SELECT / WITH queries in read-only analytics
  const normalized = sanitizedSql.trim().toUpperCase();
  const isSelectOrWith = normalized.startsWith('SELECT') || normalized.startsWith('WITH');

  if (!isSelectOrWith) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Security Notice: Only SELECT queries are permitted in client-side analytics mode.',
      sanitizedSql,
    };
  }

  // Ensure dataset is registered if provided
  if (dataset) {
    registerDatasetInSql(dataset);
  }

  try {
    const rawResult = alasql(sanitizedSql);
    const duration = Math.max(1, Math.round(performance.now() - startTime));

    // Result might be array of objects or single value
    let rows: Record<string, any>[] = [];
    if (Array.isArray(rawResult)) {
      rows = rawResult.map((r) => {
        if (typeof r === 'object' && r !== null) {
          return r;
        }
        return { value: r };
      });
    } else if (rawResult !== undefined && rawResult !== null) {
      rows = [{ result: rawResult }];
    }

    // Determine column headers dynamically
    const columnSet = new Set<string>();
    rows.forEach((r) => {
      Object.keys(r).forEach((k) => columnSet.add(k));
    });

    const columns = Array.from(columnSet);

    return {
      success: true,
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs: duration,
      sanitizedSql,
    };
  } catch (err: any) {
    const duration = Math.max(1, Math.round(performance.now() - startTime));
    let errorMessage = err?.message || String(err);

    // Provide friendly guidance for common SQL dialect errors
    if (errorMessage.includes('Parse error') || errorMessage.includes('syntax error')) {
      errorMessage = `SQL Syntax Error: ${errorMessage}. Check for column names or date format functions.`;
    }

    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: duration,
      error: errorMessage,
      sanitizedSql,
    };
  }
}
