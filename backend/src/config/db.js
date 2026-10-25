import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const defaultDbConfig = {
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '2s71eTPtXqr9hqJ.root',
    password: 'vS6SmDO4FtkqMs0P',
    database: 'japanese_learning_db'
};

const pool = mysql.createPool({
    host: (process.env.DB_HOST ?? defaultDbConfig.host).trim(),
    port: Number(process.env.DB_PORT ?? defaultDbConfig.port),
    user: (process.env.DB_USER ?? defaultDbConfig.user).trim(),
    password: (process.env.DB_PASSWORD ?? defaultDbConfig.password).trim(),
    database: (process.env.DB_NAME ?? defaultDbConfig.database).trim(),
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;