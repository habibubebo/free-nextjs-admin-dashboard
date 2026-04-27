import db from "./db";

/**
 * Execute a query with proper connection management
 * Automatically releases connection after query completes
 */
export async function executeQuery<T>(
  query: string,
  params?: any[]
): Promise<[T[], any]> {
  const connection = await db.getConnection();
  try {
    const result = await connection.query(query, params);
    return result as [T[], any];
  } finally {
    connection.release();
  }
}

/**
 * Execute multiple queries in sequence with proper connection management
 */
export async function executeQueries(
  queries: Array<{ query: string; params?: any[] }>
): Promise<any[]> {
  const connection = await db.getConnection();
  try {
    const results = [];
    for (const { query, params } of queries) {
      const result = await connection.query(query, params);
      results.push(result);
    }
    return results;
  } finally {
    connection.release();
  }
}
