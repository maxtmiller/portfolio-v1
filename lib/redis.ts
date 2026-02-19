import { createClient } from 'redis';

const globalForRedis = global as unknown as { redisClient: ReturnType<typeof createClient> };

export const redisClient = globalForRedis.redisClient || createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_ENDPOINT,
        port: Number(process.env.REDIS_PORT) || 6379,
        family: 4 
    }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redisClient = redisClient;

redisClient.on('error', err => console.error('Redis Client Error:', err));

// Only connect to Redis at runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    (async () => {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Successfully connected to Redis Cloud');
        }
    })().catch(console.error);
}


// async function setupCacheIndex() {
//     try {
//         // FT.CREATE idx:cache ON HASH PREFIX 1 cache: SCHEMA vector VECTOR FLAT 6 TYPE FLOAT32 DIM 1536 DISTANCE_METRIC COSINE content TEXT
//         await redisClient.ft.create('idx:cache', {
//             'vector': {
//                 type: 'VECTOR',
//                 ALGORITHM: 'FLAT', // 'FLAT' is perfect for smaller caches; use 'HNSW' for millions of entries
//                 TYPE: 'FLOAT32',
//                 DIM: 1536,
//                 DISTANCE_METRIC: 'COSINE'
//             },
//             'content': 'TEXT'
//         }, {
//             ON: 'HASH',
//             PREFIX: 'cache:'
//         });
//         console.log("Vector index created successfully.");
//     } catch (e) {
//         if (e.message.includes('Index already exists')) {
//             console.log("Index exists, we are good to go.");
//         } else {
//             console.error("Error creating index:", e);
//         }
//     }
// }
