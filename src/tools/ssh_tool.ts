import { Client } from 'ssh2';

// 存储SSH连接的缓存
let sshConnections: { [key: string]: Client } = {};

// 定义 ssh_tool 工具的参数列表
export const schema = {
    name: "ssh_tool",
    description: "Connect to SSH server and execute commands",
    type: "object",
    properties: {
        serverName: {
            type: "string",
            description: "The name of the SSH server to connect to.",
        },
        command: {
            type: "string",
            description: "The command to execute on the SSH server.",
        },
    },
    required: ["serverName", "command"],
    outputSchema: {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: {
                    type: {
                        type: "string",
                        description: "The content type (e.g., 'text')."
                    },
                    text: {
                        type: "string",
                        description: "The query result in JSON string format."
                    }
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

/**
 * 获取SSH连接
 * @param serverName 服务器名称
 * @returns SSH连接实例
 */
async function getSSHConnection(serverName: string): Promise<Client> {
    // 如果已有连接，直接返回
    if (sshConnections[serverName]) {
        return sshConnections[serverName];
    }

    // 从环境变量获取连接信息
    const sshUri = process.env[`SSH_${serverName}_URI`];
    if (!sshUri) {
        throw new Error(`SSH_${serverName}_URI environment variable must be set.`);
    }

    // 解析连接信息
    const [usernameAndpassword, HostAndport] = sshUri.split('@');
    const [username, password] = usernameAndpassword.split(':');
    const [host, port] = HostAndport.split(':');

    // 创建新连接
    return new Promise((resolve, reject) => {
        const conn = new Client();
        
        conn.on('ready', () => {
            sshConnections[serverName] = conn;
            resolve(conn);
        });
        
        conn.on('error', (err) => {
            delete sshConnections[serverName];
            reject(new Error(`SSH connection error: ${err.message}`));
        });
        
        conn.on('end', () => {
            delete sshConnections[serverName];
        });
        
        conn.connect({
            host: host,
            port: parseInt(port),
            username: username,
            password: password
        });
    });
}

/**
 * 在SSH服务器上执行命令
 * @param conn SSH连接
 * @param command 要执行的命令
 * @returns 命令执行结果
 */
async function executeCommand(conn: Client, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
            if (err) {
                reject(new Error(`Command execution failed: ${err.message}`));
                return;
            }
            
            let output = '';
            let errorOutput = '';
            
            stream.on('close', (code, signal) => {
                // 如果有错误输出，但命令仍然成功执行，我们仍然返回完整输出
                resolve(output);
            });
            
            stream.on('data', (data) => {
                output += data.toString();
            });
            
            stream.stderr.on('data', (data) => {
                const errorData = data.toString();
                errorOutput += errorData;
                output += 'ERROR: ' + errorData;
            });
            
            stream.on('error', (err) => {
                reject(new Error(`Stream error: ${err.message}`));
            });
        });
    });
}

export default async (request: any) => {
    try {
        // 解析请求参数
        const { serverName, command } = request.params.arguments;
        
        // 验证参数
        if (!serverName || !command) {
            throw new Error("Missing required parameters: serverName, command");
        }
        
        // 获取SSH连接
        const conn = await getSSHConnection(serverName);
        
        // 执行命令
        const result = await executeCommand(conn, command);
        
        // 返回成功结果
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        output: result,
                        server: serverName,
                        command: command
                    })
                }
            ]
        };
    } catch (error) {
        // 返回错误结果
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : String(error)
                    })
                }
            ],
            isError: true
        };
    }
};
