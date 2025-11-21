# 中国境内网络环境部署指南

本指南介绍如何在中国境内网络环境下使用 TGO 部署脚本，通过使用国内镜像源来加速部署过程。

## 概述

TGO 提供了完整的中国境内网络优化方案，包括：

1. **一键部署脚本** (`bootstrap_cn.sh`): 使用 Gitee 镜像仓库加速 Git 克隆
2. **部署脚本参数** (`--cn`): 使用阿里云 ACR 加速 Docker 镜像拉取
3. **静态配置文件** (`docker-compose.cn.yml`): 预配置的中国镜像映射

启用中国镜像优化后，脚本会自动使用以下国内镜像源：

- **Git 仓库**: Gitee - `https://gitee.com/tgoai/tgo.git`
- **Docker 镜像**: 阿里云容器镜像服务 (ACR) - `registry.cn-shanghai.aliyuncs.com`

## 使用方法

### 方式一：一键部署（推荐）⚡

使用 `bootstrap_cn.sh` 脚本在干净的服务器上一键完成所有部署：

```bash
# 远程执行（推荐）
curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash

# 或本地执行
bash ./bootstrap_cn.sh
```

**优势**：
- 自动检查并安装 Git、Docker、Docker Compose
- 使用 Gitee 镜像加速仓库克隆（**10-15x** 提升）
- 自动执行 `./tgo.sh install --cn` 使用阿里云 ACR 镜像
- 一条命令完成从零到运行的全部流程

### 方式二：手动部署

如果已经克隆了仓库，可以直接使用 `tgo.sh` 脚本：

#### 1. 基础部署（使用预构建镜像）

```bash
# 使用阿里云 ACR 镜像部署
./tgo.sh install --cn
```

这将：
- 使用 `docker-compose.cn.yml` 配置文件
- 从阿里云 ACR 拉取所有服务镜像
- 启动所有服务

#### 2. 从源码构建部署

```bash
# 从本地源码构建并部署
./tgo.sh install --source --cn
```

注意：`--source` 模式下，`--cn` 参数主要用于标记，实际构建使用本地代码。

#### 3. 参数组合

`--cn` 和 `--source` 参数可以任意顺序组合使用：

```bash
# 以下命令等效
./tgo.sh install --cn --source
./tgo.sh install --source --cn
```

#### 4. 其他命令

所有主要命令都支持 `--cn` 参数：

```bash
# 卸载服务
./tgo.sh uninstall --cn

# 启动服务
./tgo.sh service start --cn

# 停止服务
./tgo.sh service stop --cn

# 重新构建特定服务
./tgo.sh build --source --cn rag
```

## 镜像地址映射

使用 `--cn` 参数时，镜像地址会自动映射：

| 服务 | 默认镜像 (GHCR) | 中国镜像 (ACR) |
|------|----------------|---------------|
| tgo-rag | `ghcr.io/tgoai/tgo/tgo-rag:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-rag:latest` |
| tgo-ai | `ghcr.io/tgoai/tgo/tgo-ai:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-ai:latest` |
| tgo-api | `ghcr.io/tgoai/tgo/tgo-api:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-api:latest` |
| tgo-platform | `ghcr.io/tgoai/tgo/tgo-platform:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-platform:latest` |
| tgo-web | `ghcr.io/tgoai/tgo/tgo-web:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-web:latest` |
| tgo-widget-app | `ghcr.io/tgoai/tgo/tgo-widget-app:latest` | `registry.cn-shanghai.aliyuncs.com/tgoai/tgo-widget-app:latest` |

## 技术细节

### 配置文件说明

`docker-compose.cn.yml` 是项目中的静态配置文件，包含所有服务的中国镜像地址覆盖配置。

**特点**:
- `docker-compose.cn.yml` 是版本控制的一部分，可以直接查看和编辑
- 该文件覆盖了所有 TGO 应用服务和基础设施服务的镜像地址
- 支持自定义修改，例如添加新的镜像映射或修改镜像版本

**包含的镜像映射**：
- **TGO 应用服务**: tgo-rag, tgo-ai, tgo-api, tgo-platform, tgo-web, tgo-widget-app
- **基础设施服务**: PostgreSQL (pgvector), Redis, Kafka

### Docker Compose 文件层级

使用 `--cn` 参数时的 compose 文件加载顺序：

```bash
# 不使用 --cn (默认)
docker-compose.yml

# 使用 --cn
docker-compose.yml + docker-compose.cn.yml

# 使用 --source
docker-compose.yml + docker-compose.source.yml

# 使用 --source --cn
docker-compose.yml + docker-compose.source.yml
```

## 常见问题

### Q: 为什么 `--source --cn` 模式下还需要 `--cn` 参数？

A: 虽然 `--source` 模式从本地构建镜像，但 `--cn` 参数可以用于：
- 标记部署环境为中国境内
- 未来可能添加的其他优化（如包管理器镜像源配置）
- 保持命令行接口的一致性

### Q: 如何验证是否使用了中国镜像？

A: 查看脚本输出，应该看到类似信息：

```
[INFO] Deployment mode: IMAGE (using pre-built images from Alibaba Cloud ACR).
[INFO] Generated China mirror compose override: docker-compose.cn.yml
```

### Q: 可以手动编辑 `docker-compose.cn.yml` 吗？

A: **可以**。`docker-compose.cn.yml` 现在是项目的正式配置文件，可以直接编辑。例如：
- 修改镜像版本号
- 添加新的服务镜像映射
- 使用不同的镜像仓库地址

编辑后的修改会在下次运行 `./tgo.sh install --cn` 时生效。

### Q: 如何为新服务添加中国镜像？

A: 直接编辑 `docker-compose.cn.yml` 文件，添加新的服务配置：

```yaml
services:
  my-new-service:
    image: registry.cn-shanghai.aliyuncs.com/tgoai/my-new-service:latest
```

## 性能对比

在中国境内网络环境下，使用 `--cn` 参数可以显著提升部署速度：

| 操作 | 不使用 --cn | 使用 --cn | 提升 |
|------|------------|----------|------|
| 拉取镜像 | ~10-30 分钟 | ~2-5 分钟 | **5-10x** |
| 首次部署 | ~15-40 分钟 | ~5-10 分钟 | **3-4x** |

*注：实际速度取决于网络状况和镜像大小*

## 故障排除

### 镜像拉取失败

如果从阿里云 ACR 拉取镜像失败，请检查：

1. 网络连接是否正常
2. 阿里云 ACR 镜像是否已推送（通过 GitHub Actions）
3. 尝试手动拉取测试：
   ```bash
   docker pull registry.cn-shanghai.aliyuncs.com/tgoai/tgo-rag:latest
   ```

### 回退到默认镜像

如果需要回退到使用 GHCR 镜像，只需移除 `--cn` 参数：

```bash
./tgo.sh install
```

## 相关文档

- [部署指南](./deployment-guide.md)
- [GitHub Actions 构建配置](../.github/workflows/build-and-push.yml)
- [Docker Compose 配置](../docker-compose.yml)

