# 多架构支持文档

## 概述

TGO 项目的所有 Docker 镜像现在支持多架构构建，可以在以下平台上运行：
- **AMD64** (x86_64) - 传统 x86 服务器和 PC
- **ARM64** (aarch64) - Apple Silicon (M1/M2/M3)、AWS Graviton、树莓派 4/5 等

## 支持的服务

所有 TGO 服务都支持多架构：

| 服务 | AMD64 | ARM64 | 基础镜像 |
|------|-------|-------|---------|
| tgo-api | ✅ | ✅ | python:3.11-slim |
| tgo-ai | ✅ | ✅ | python:3.11-slim |
| tgo-platform | ✅ | ✅ | python:3.11-slim |
| tgo-rag | ✅ | ✅ | python:3.11-slim |
| tgo-web | ✅ | ✅ | node:20-alpine + nginx:alpine |
| tgo-widget-app | ✅ | ✅ | node:20-alpine + nginx:alpine |

## 使用方法

### 自动架构选择

Docker 会自动选择与您的系统架构匹配的镜像：

```bash
# 在 AMD64 系统上，自动拉取 AMD64 镜像
docker pull ghcr.io/tgoai/tgo-deploy/tgo-api:latest

# 在 ARM64 系统上（如 Apple Silicon），自动拉取 ARM64 镜像
docker pull ghcr.io/tgoai/tgo-deploy/tgo-api:latest
```

### 手动指定架构

如果需要拉取特定架构的镜像：

```bash
# 拉取 AMD64 镜像
docker pull --platform linux/amd64 ghcr.io/tgoai/tgo-deploy/tgo-api:latest

# 拉取 ARM64 镜像
docker pull --platform linux/arm64 ghcr.io/tgoai/tgo-deploy/tgo-api:latest
```

### 在 Docker Compose 中使用

Docker Compose 会自动选择正确的架构，无需额外配置：

```bash
# 在任何架构上都可以直接使用
./tgo.sh install
```

## 镜像仓库

多架构镜像在所有三个镜像仓库中都可用：

### 1. GitHub Container Registry (GHCR)

```bash
docker pull ghcr.io/tgoai/tgo-deploy/tgo-api:latest
```

### 2. Docker Hub

```bash
docker pull tgoai/tgo-api:latest
```

### 3. 阿里云容器镜像服务 (ACR)

```bash
docker pull registry.cn-shanghai.aliyuncs.com/tgoai/tgo-api:latest
```

## 验证多架构支持

### 检查镜像清单

使用 `docker buildx imagetools inspect` 查看镜像支持的架构：

```bash
# 检查 GHCR 镜像
docker buildx imagetools inspect ghcr.io/tgoai/tgo-deploy/tgo-api:latest

# 输出示例：
# Name:      ghcr.io/tgoai/tgo-deploy/tgo-api:latest
# MediaType: application/vnd.oci.image.index.v1+json
# Digest:    sha256:abc123...
#
# Manifests:
#   Name:      ghcr.io/tgoai/tgo-deploy/tgo-api:latest@sha256:def456...
#   MediaType: application/vnd.oci.image.manifest.v1+json
#   Platform:  linux/amd64
#
#   Name:      ghcr.io/tgoai/tgo-deploy/tgo-api:latest@sha256:ghi789...
#   MediaType: application/vnd.oci.image.manifest.v1+json
#   Platform:  linux/arm64
```

### 检查 Docker Hub 镜像

```bash
docker buildx imagetools inspect tgoai/tgo-api:latest
```

### 检查阿里云 ACR 镜像

```bash
docker buildx imagetools inspect registry.cn-shanghai.aliyuncs.com/tgoai/tgo-api:latest
```

## 构建流程

### GitHub Actions 工作流

多架构构建在 GitHub Actions 中自动完成：

1. **设置 QEMU**: 模拟 ARM64 架构
2. **设置 Docker Buildx**: 启用多平台构建
3. **构建镜像**: 同时构建 AMD64 和 ARM64 版本
4. **推送镜像**: 推送到三个镜像仓库
5. **验证清单**: 确认两个架构都存在

### 本地多架构构建

如果需要在本地构建多架构镜像：

```bash
# 1. 创建 buildx builder
docker buildx create --name multiarch --use

# 2. 启动 builder
docker buildx inspect --bootstrap

# 3. 构建并推送多架构镜像
cd repos/tgo-api
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag your-registry/tgo-api:latest \
  --push \
  .
```

## 性能考虑

### ARM64 优势

在 ARM64 平台上运行原生 ARM64 镜像的优势：

- **性能**: 原生执行，无需模拟
- **效率**: 更低的功耗和成本（如 AWS Graviton）
- **兼容性**: 完美支持 Apple Silicon Mac

### 构建时间

多架构构建会增加 CI/CD 时间：

| 服务 | 单架构 (AMD64) | 多架构 (AMD64+ARM64) | 增加 |
|------|---------------|---------------------|------|
| tgo-api | ~3 分钟 | ~5 分钟 | +67% |
| tgo-rag | ~8 分钟 | ~14 分钟 | +75% |
| tgo-web | ~2 分钟 | ~3 分钟 | +50% |

## 兼容性说明

### Python 服务 (tgo-api, tgo-ai, tgo-platform, tgo-rag)

- ✅ **基础镜像**: `python:3.11-slim` 官方支持 ARM64
- ✅ **依赖**: 所有 Python 包都有 ARM64 wheel 或可以从源码编译
- ✅ **系统依赖**: 
  - `libpq-dev` (PostgreSQL) - ARM64 可用
  - `tesseract-ocr` (OCR) - ARM64 可用
  - `libreoffice-core` (文档处理) - ARM64 可用

### Node.js 服务 (tgo-web, tgo-widget-app)

- ✅ **基础镜像**: `node:20-alpine` 和 `nginx:alpine` 都支持 ARM64
- ✅ **依赖**: 所有 npm 包都支持 ARM64

## 常见问题

### Q: 如何知道我正在使用哪个架构的镜像？

A: 使用 `docker inspect` 查看：

```bash
docker inspect ghcr.io/tgoai/tgo-deploy/tgo-api:latest | grep Architecture
# 输出: "Architecture": "arm64" 或 "amd64"
```

### Q: 可以在 ARM64 Mac 上运行 AMD64 镜像吗？

A: 可以，但会通过 QEMU 模拟，性能会下降：

```bash
docker run --platform linux/amd64 ghcr.io/tgoai/tgo-deploy/tgo-api:latest
```

### Q: 多架构镜像会占用更多存储空间吗？

A: 在镜像仓库中会存储两个版本，但在本地只会拉取您系统架构的版本，不会占用额外空间。

### Q: 如何在 CI/CD 中指定架构？

A: 使用 `--platform` 参数：

```yaml
- name: Test on ARM64
  run: |
    docker run --platform linux/arm64 \
      ghcr.io/tgoai/tgo-deploy/tgo-api:latest \
      python -c "import platform; print(platform.machine())"
```

## 相关文档

- [GitHub Actions 工作流](../.github/workflows/build-and-push.yml)
- [Docker Buildx 文档](https://docs.docker.com/buildx/working-with-buildx/)
- [多平台镜像](https://docs.docker.com/build/building/multi-platform/)

---

**创建日期**: 2024-11-21  
**版本**: v1.0

