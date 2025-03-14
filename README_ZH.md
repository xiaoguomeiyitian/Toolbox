# ToolBox MCP 服务器

一个多功能的 Model Context Protocol (MCP) 服务器，提供了一系列用于各种任务的工具。

这个基于 TypeScript 编写的服务器充当一个工具箱，提供从笔记创建到数据操作和系统交互的功能。它通过以下方式展示了核心 MCP 概念：

- 公开执行特定操作的工具。
- 根据工具执行动态生成资源。
- 提供用于数据汇总和其他任务的提示。

[英文文档](README.md)

[工具规范文档](TOOL_ZH.md) | [Tool Specifications](TOOL.md)

## 特性

### 工具

查看完整的工具规范和详细文档：[TOOL_ZH.md](TOOL_ZH.md)

### 资源

资源是作为工具执行的结果动态生成的。例如，`create_note` 工具创建一个可以通过其 URI 访问的笔记资源。

### 提示

- `summarize_notes`: 生成使用 `create_note` 工具创建的笔记的摘要。

## 开发指南

### 添加新工具
查看完整开发文档: [prompt_zh.md](prompt_zh.md)

核心步骤：
1. 创建工具文件 (my_tool.ts)
2. 定义参数规范 (schema对象)
3. 实现工具逻辑 (default函数)
4. 编译并测试工具

[详细文档](prompt_zh.md) 包含参数验证、错误处理等最佳实践

## 开发

安装依赖项：

```bash
npm install
```

构建服务器：

```bash
npm run build
```

用于自动重建的开发：

```bash
npm run watch
```

## 安装

要与 Claude Desktop 应用程序集成，请将以下服务器配置添加到：

-   macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
-   Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
// Cline MCP server configuration file
{
  "command": "node",
  "args": [
    "--inspect=9229",
    "/MCP/ToolBox/build/index.js"
  ],
  "env": {
    "MONGO_URI": "mongodb://user:password@host:port/db",
    "MONGO_INDEX_OPS": "true",
    "REDIS_URI": "redis://:password@host:port",
    "SSH_server1_URI": "username:password@host:port"
  },
  "disabled": false,
  "autoApprove": []
}
```

## 核心价值

🚀 **企业级自动化**  
基于 package.json 配置，提供：
- 全局 CLI 工具安装 (`tbx` 命令)
- 工作流调度引擎 (node-cron 集成)
- 多平台支持 (Windows/macOS)
- 混合云部署能力 (MongoDB/Redis/SSH)

🔧 **开发者友好**  
- 强类型 TypeScript 实现
- 实时调试支持 (--inspect flag)
- VSCode 调试配置模板

## 调试

由于 MCP 服务器的 stdio 通信，调试 MCP 服务器可能具有挑战性。以下是一些方法：

### 法律责任 ⚠️
- ⚠️ 本工具按MIT许可证"现状"提供，不作任何担保  
- ⚠️ 使用本工具产生的直接/间接损失开发者概不负责  
- ⚠️ 用户需自行承担容器配置不当导致的风险  
- ⚠️ 禁止将本工具用于违法或破坏性用途  
- ⚠️ 完整条款参见[LICENSE](LICENSE)文件

🚧 Disclaimers

### Sensitive Data
请勿使用敏感数据配置容器。这包括 API 密钥、数据库密码等。

与 LLM 交换的任何敏感数据本质上都是不安全的，除非 LLM 在您的本地机器上运行。

1.  **Node.js 检查器：** 使用 `--inspect=9229` 标志启动服务器：

```bash
node --inspect=9229 build/index.js
```

然后，通过导航到 `chrome://inspect`，使用 Chrome DevTools 连接到服务器。

2.  **MCP 检查器：** 利用 [MCP 检查器](https://github.com/modelcontextprotocol/inspector)，这是一个通过 `inspector` npm 脚本访问的专用调试工具：

3.  **VSCode 调试**

要使用 VSCode 进行调试，请创建一个包含以下配置的 `.vscode/launch.json` 文件：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "ToolBox",
            "address": "localhost",
            "port": 9229,
            "localRoot": "${workspaceFolder}"
        }
    ]
}
```

然后，使用 `--inspect=9229` 标志启动服务器并附加 VSCode 调试器。
