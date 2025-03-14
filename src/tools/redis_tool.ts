import { Redis } from 'ioredis';

// 获取 Redis 连接 URL
const REDIS_URI = process.env.REDIS_URI;
if (!REDIS_URI) throw new Error("REDIS_URI environment variable is not set.");
const redisClient: Redis = new Redis(REDIS_URI);

/** Parameter list for the redis_tool */
export const schema = {
    name: "redis_tool",
    description: "Execute any Redis command, fully supporting all Redis operations, including strings, hashes, lists, sets, sorted sets, streams, etc.",
    type: "object",
    properties: {
        command: {
            type: "string",
            description: "The Redis command to execute (e.g., 'GET', 'SET', 'HGETALL', 'LPUSH', 'ZADD', etc.).",
        },
        args: {
            type: "string",
            description: "The arguments for the Redis command, provided in JSON string format. For example, for SET: '[\"key\", \"value\"]', for HSET: '[\"hash\", \"field\", \"value\"]'.",
        },
    },
    required: ["command"],
    outputSchema: {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: {
                            type: "string",
                            description: "Content type (e.g., 'text')."
                        },
                        text: {
                            type: "string",
                            description: "The query result returned in JSON string format."
                        }
                    },
                    required: ["type", "text"]
                },
                description: "An array containing the query result."
            },
            isError: {
                type: "boolean",
                description: "Indicates whether an error occurred during the query.",
                default: false
            }
        },
        required: ["content"]
    }
};

export default async (request: any) => {
    try {
        const command = String(request.params.arguments?.command).toUpperCase();
        const argsString = request.params.arguments?.args;
        let args = [];
        try {
            args = argsString ? JSON.parse(argsString) : [];
        } catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: "Invalid JSON format for the 'args' parameter",
                            hint: "'args' should be a valid JSON array string. For example: '[\"key\", \"value\"]'"
                        }),
                    },
                ],
                isError: true,
            };
        }

        let results: any;

        try {
            results = await redisClient.call(command, ...args);

            // Formats Redis results based on command type for improved readability
            const formattedResults = formatRedisResults(command, results);

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(formattedResults),
                    },
                ],
            };
        } catch (error: any) {
            const errorResponse = {
                error: {
                    code: error.code || "REDIS_ERROR",
                    message: error.message,
                },
                command: command,
                args: args,
                hint: getErrorHint(command, error.message)
            };
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(errorResponse),
                    },
                ],
                isError: true,
            };
        }
    } catch (error: any) {
        let errorMessage = "Redis query error";
        let errorCode = "UNKNOWN_ERROR";

        if (error instanceof Error) {
            errorMessage = error.message;
            errorCode = error.name;
        }

        const errorResponse = {
            error: {
                code: errorCode,
                message: errorMessage,
            },
        };

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(errorResponse),
                },
            ],
            isError: true,
        };
    }
};

/**
 * Formats Redis results based on command type for improved readability
 */
function formatRedisResults(command: string, results: any): any {
    // Handle null results
    if (results === null) {
        return { result: null };
    }

    // Handle array results from commands like HGETALL
    if (Array.isArray(results) && command === 'HGETALL') {
        const obj: Record<string, any> = {};
        for (let i = 0; i < results.length; i += 2) {
            if (i + 1 < results.length) {
                obj[results[i]] = results[i + 1];
            }
        }
        return obj;
    }

    // Handle other array results
    if (Array.isArray(results)) {
        return results;
    }

    // Handle Buffer results
    if (Buffer.isBuffer(results)) {
        return results.toString();
    }

    return results;
}

/**
 * Provides helpful hints for common Redis errors
 */
function getErrorHint(command: string, errorMessage: string): string {
    if (errorMessage.includes("wrong number of arguments")) {
        return getCommandSyntaxHint(command);
    }

    if (errorMessage.includes("WRONGTYPE")) {
        return "The data type of the key does not match the requested command operation.";
    }

    if (errorMessage.includes("no such key")) {
        return "The specified key does not exist.";
    }

    return "Please check the command syntax and parameters.";
}

/**
 * Provides syntax hints for common Redis commands
 */
function getCommandSyntaxHint(command: string): string {
    const syntaxMap: Record<string, string> = {
        'GET': 'GET key',
        'SET': 'SET key value [EX seconds] [PX milliseconds] [NX|XX]',
        'HGET': 'HGET key field',
        'HSET': 'HSET key field value [field value ...]',
        'HGETALL': 'HGETALL key',
        'LPUSH': 'LPUSH key element [element ...]',
        'RPUSH': 'RPUSH key element [element ...]',
        'LRANGE': 'LRANGE key start stop',
        'SADD': 'SADD key member [member ...]',
        'SMEMBERS': 'SMEMBERS key',
        'ZADD': 'ZADD key score member [score member ...]',
        'ZRANGE': 'ZRANGE key start stop [WITHSCORES]',
        'DEL': 'DEL key [key ...]',
        'EXISTS': 'EXISTS key [key ...]',
        'EXPIRE': 'EXPIRE key seconds',
        'TTL': 'TTL key',
        'INCR': 'INCR key',
        'DECR': 'DECR key',
    };

    return syntaxMap[command] || `Please consult the Redis documentation for the syntax of ${command}.`;
}
