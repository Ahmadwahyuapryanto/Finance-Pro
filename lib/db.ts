import mysql from 'mysql2/promise';

export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  
  const dbconnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 4000,
    // 👇👇👇 BAGIAN INI SANGAT PENTING 👇👇👇
    ssl: {
        rejectUnauthorized: false
    }
    // 👆👆👆 JANGAN SAMPAI TERLEWAT 👆👆👆
  });

  try {
    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    return results;
  } catch (error: any) {
    dbconnection.end();
    throw Error(error.message);
  }
}
