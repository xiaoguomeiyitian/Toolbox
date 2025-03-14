## 工具规范

### compress_tool
**描述**: 使用 zip/tar/tar.gz 格式进行文件压缩和解压  

**输入规范**:
| 参数 | 类型 | 必填 | 描述 | 可选值 |
|-----------|------|----------|-------------|-------------|
| action | string | 是 | 操作类型 | ["compress", "extract"] |
| sourcePath | string | 是 | 源文件绝对路径 | - |
| destinationPath | string | 是 | 目标路径绝对地址 | - | 
| format | string | 是 | 压缩格式 | ["zip", "tar", "tar.gz"] |

**输出规范**:
```typescript
{
  content: Array<{ type: "text", text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "action": "compress",
  "sourcePath": "/path/to/files",
  "destinationPath": "/path/to/archive.zip",
  "format": "zip"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段包含错误信息

---

### create_note
**描述**: 创建并存储文本笔记  

**输入规范**:
| 参数 | 类型 | 必填 | 描述 |
|-----------|------|----------|-------------|
| title | string | 是 | 笔记标题 |
| content | string | 是 | 笔记内容 |

**输出规范**:
```typescript
{
  content: [{
    type: "text",
    text: "笔记已创建: {note_id}"
  }];
}
```

**请求示例**:
```json
{
  "title": "会议记录",
  "content": "讨论项目需求"
}
```

**错误情况**:
- 存储失败时返回 `isError: true`

---

### mongo_tool
**描述**: 综合 MongoDB 操作工具，支持查询、聚合、CRUD 操作和索引管理

**输入规范**:
| 参数 | 类型 | 必填 | 描述 | 可选值 |
|---|---|---|---|---|
| where | string | 否 | JSON 字符串格式的查询条件。 例如: {\"age\": {\"$gt\": 18}} 查找 18 岁以上的用户。 |  |
| dbName | string | 是 | 要查询的 MongoDB 数据库的名称。 |  |
| collectionName | string | 否 | 要查询的 MongoDB 集合的名称。 |  |
| field | string | 否 | distinct 操作的字段名称。 |  |
| queryType | string | 否 | 要执行的 MongoDB 查询的类型。 | ["find", "findOne", "aggregate", "count", "distinct", "insertOne", "updateOne", "deleteOne", "insertMany", "updateMany", "deleteMany", "bulkWrite", "estimatedDocumentCount", "findOneAndUpdate", "findOneAndDelete", "findOneAndReplace"] |
| data | string | 否 | 要插入/更新的 JSON 字符串格式的数据。insert/update 操作需要。 |  |
| updateOperators | string | 否 | JSON 字符串格式的更新运算符。update 操作需要。 |  |
| options | string | 否 | JSON 字符串格式的附加选项 (例如，sort、limit、skip、projection)。 |  |
| operationType | string | 否 | 索引和集合管理的数据库操作类型 | ["createIndex", "createIndexes", "dropIndex", "dropIndexes", "listIndexes", "listCollections", "createCollection", "dropCollection", "renameCollection", "collStats", "dbStats"] |
| indexes | string | 否 | 索引操作的索引规范 JSON |  |
| indexOptions | string | 否 | JSON 字符串格式的索引选项 (例如，unique、sparse、expireAfterSeconds) |  |
| pipeline | string | 否 | JSON 字符串格式的聚合管道阶段。aggregate 操作需要。 |  |
| newName | string | 否 | renameCollection 操作的新名称 |  |
| bulkOperations | string | 否 | JSON 字符串格式的批量写入操作数组。bulkWrite 操作需要。 |  |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "dbName": "your_db",
  "collectionName": "your_collection",
  "queryType": "find",
  "where": "{\\"status\\": \\"active\\"}",
  "options": "{\\"limit\\": 10}"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息

---

### redis_tool
**描述**: 执行任何 Redis 命令，完全支持所有 Redis 操作，包括字符串、哈希、列表、集合、排序集合、流等。

**输入规范**:
| 参数 | 类型 | 必填 | 描述 |
|---|---|---|---|
| command | string | 是 | 要执行的 Redis 命令 (例如, 'GET', 'SET', 'HGETALL', 'LPUSH', 'ZADD' 等)。 |
| args | string | 否 | Redis 命令的参数，以 JSON 字符串格式提供。 例如，对于 SET: '[\"key\", \"value\"]'，对于 HSET: '[\"hash\", \"field\", \"value\"]'。 |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
    "command": "SET",
    "args": "[\"mykey\", \"myvalue\"]"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息

---

### schedule_tool
**描述**: 安排任务和提醒。

**输入规范**:
| 参数 | 类型 | 必填 | 描述 | 可选值 |
|---|---|---|---|---|
| action | string | 是 | 操作类型 | ["create", "cancel", "list", "cancel_all_once", "cancel_all_recurring"] |
| time | string | 否 | 时间格式: weekly@EEE@HH:mm, monthly@DD@HH:mm, now+Nm (N 分钟后), now+Ns (N 秒后), once@YYYY-MM-DD HH:mm |  |
| delaySeconds | number | 否 | 延迟执行的秒数 (例如 300 表示 5 分钟) |  |
| interval | string | 否 | 循环间隔模式 (例如 'every@5m' 表示 5 分钟, 'every@30s' 表示 30 秒) |  |
| toolName | string | 否 | 要执行的工具的名称 (例如 'time_tool') |  |
| toolArgs | object | 否 | 目标工具的参数 |  |
| id | string | 否 | 任务 ID (取消时需要) |  |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "action": "create",
  "time": "now+5m",
  "toolName": "time_tool",
  "toolArgs": {}
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息

---

### sftp_tool
**描述**: 上传和下载文件到/从 SSH 服务器。

**输入规范**:
| 参数 | 类型 | 必填 | 描述 |
|---|---|---|---|
| serverName | string | 是 | 要连接的 SSH 服务器的名称。 |
| action | string | 是 | 要执行的操作: 'upload' 或 'download'。 |
| localPath | string | 是 | 本地文件路径。需要绝对路径。 |
| remotePath | string | 是 | 远程文件路径。 |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "serverName": "my_ssh_server",
  "action": "upload",
  "localPath": "/path/to/local/file",
  "remotePath": "/path/to/remote/file"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息

---

### ssh_tool
**描述**: 在 SSH 服务器上执行命令。

**输入规范**:
| 参数 | 类型 | 必填 | 描述 |
|---|---|---|---|
| serverName | string | 是 | 要连接的 SSH 服务器的名称。 |
| command | string | 是 | 要在 SSH 服务器上执行的命令。 |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "serverName": "my_ssh_server",
  "command": "ls -l"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息

---

### time_tool
**描述**: 获取当前时间

**输入规范**:
| 参数 | 类型 | 必填 | 描述 | 可选值 |
|---|---|---|---|---|
| format | string | 否 | 要返回的时间格式 | ["iso", "timestamp", "local", "custom"] |
| pattern | string | 否 | 当 format 为 custom 时，要使用的自定义格式模式。当 format 为 custom 时，是必需的。 |  |
| timezone | string | 否 | 要使用的时区。默认为系统时区。示例: Asia/Shanghai |  |

**输出规范**:
```typescript
{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
```

**请求示例**:
```json
{
  "format": "iso",
  "timezone": "Asia/Shanghai"
}
```

**错误处理**:
- 返回 `isError: true` 并在 `content.text` 字段中包含错误消息
