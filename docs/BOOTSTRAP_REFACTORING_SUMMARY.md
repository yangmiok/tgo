# Bootstrap 脚本重构总结

## 概述

本文档总结了 `bootstrap.sh` 和 `bootstrap_cn.sh` 的重构工作，通过引入自动化构建系统来减少代码重复，同时保持脚本的独立性和可远程执行性。

## 问题背景

### 原始状态

- `bootstrap.sh` (534 行) - 国际版
- `bootstrap_cn.sh` (544 行) - 中国版
- 两个文件有 **~510 行重复代码**（95%+ 重复率）
- 仅有 24 行差异（仓库地址、安装命令、头部注释）

### 维护问题

1. **代码重复**: 任何 bug 修复或功能添加都需要在两个文件中同步
2. **容易出错**: 手动同步容易遗漏或产生不一致
3. **维护成本高**: 需要记住修改两个文件

## 解决方案

### 设计原则

1. **保持独立性**: 生成的脚本必须是完全独立的单文件
2. **支持远程执行**: 必须支持 `curl | bash` 使用模式
3. **简化维护**: 只需维护一个源文件
4. **自动化**: 通过构建脚本自动生成变体

### 架构设计

```
┌─────────────────┐
│  bootstrap.sh   │  ← 源文件（国际版）
│   (534 lines)   │     开发者只需修改这个文件
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│build-bootstrap.sh│  ← 构建脚本
│   (自动化工具)   │     使用 sed 进行文本替换
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│bootstrap_cn.sh  │  ← 生成文件（中国版）
│   (544 lines)   │     自动生成，不应手动编辑
└─────────────────┘
```

## 实现细节

### 1. 构建脚本 (`build-bootstrap.sh`)

**功能**: 从 `bootstrap.sh` 生成 `bootstrap_cn.sh`

**替换规则**:

| 类型 | 原始内容 | 替换内容 |
|------|---------|---------|
| 头部注释 | `# Bootstrap script for one-command TGO deployment` | 添加中国优化说明（10 行） |
| 仓库地址 | `https://github.com/tgoai/tgo.git` | `https://gitee.com/tgoai/tgo.git` |
| 安装命令 | `./tgo.sh install` | `./tgo.sh install --cn` |
| 使用说明 | `bootstrap.sh` | `bootstrap_cn.sh` |

**实现**:
```bash
sed -e 's|pattern1|replacement1|' \
    -e 's|pattern2|replacement2|' \
    -e 's|pattern3|replacement3|' \
    bootstrap.sh > bootstrap_cn.sh
```

### 2. Git Hooks

**文件**: `.githooks/pre-commit`

**功能**: 当 `bootstrap.sh` 被修改时，自动重新生成 `bootstrap_cn.sh`

**工作流程**:
1. 开发者修改 `bootstrap.sh`
2. 运行 `git add bootstrap.sh`
3. 运行 `git commit`
4. **Hook 自动触发**:
   - 检测到 `bootstrap.sh` 在暂存区
   - 运行 `./build-bootstrap.sh`
   - 将 `bootstrap_cn.sh` 添加到暂存区
5. 提交包含两个文件的更改

**安装**:
```bash
git config core.hooksPath .githooks
```

### 3. 文档

新增文档：
- `docs/BOOTSTRAP_BUILD_SYSTEM.md` - 构建系统详细文档
- `docs/BOOTSTRAP_REFACTORING_SUMMARY.md` - 本文档
- `.githooks/README.md` - Git hooks 使用说明

更新文档：
- `README.md` - 添加开发者说明章节

## 使用指南

### 开发者工作流

#### 修改 Bootstrap 脚本

```bash
# 1. 编辑源文件
vim bootstrap.sh

# 2. 运行构建脚本
./build-bootstrap.sh

# 3. 验证生成的文件
bash -n bootstrap_cn.sh
diff bootstrap.sh bootstrap_cn.sh

# 4. 提交（如果安装了 Git hook，步骤 2 会自动执行）
git add bootstrap.sh bootstrap_cn.sh
git commit -m "Update bootstrap script"
```

#### 添加新功能

```bash
# 1. 在 bootstrap.sh 中添加新函数或逻辑
vim bootstrap.sh

# 2. 重新生成中国版
./build-bootstrap.sh

# 3. 测试两个版本
bash -n bootstrap.sh
bash -n bootstrap_cn.sh

# 4. 提交
git add bootstrap.sh bootstrap_cn.sh
git commit -m "Add new feature to bootstrap"
```

#### 修复 Bug

```bash
# 1. 在 bootstrap.sh 中修复
vim bootstrap.sh

# 2. 重新生成
./build-bootstrap.sh

# 3. 验证修复在两个版本中都生效
# 4. 提交
```

### 用户工作流（不变）

用户使用方式完全不变：

```bash
# 国际版
curl -fsSL https://your.host/bootstrap.sh | bash

# 中国版
curl -fsSL https://gitee.com/tgoai/tgo/raw/main/bootstrap_cn.sh | bash
```

## 验证测试

### 构建系统测试

```bash
# 运行完整验证
./build-bootstrap.sh

# 检查输出
=== Building Bootstrap Scripts ===
[INFO] Generating bootstrap_cn.sh from bootstrap.sh...
[INFO] Generated bootstrap_cn.sh (544 lines)
...
✓ Repository: GitHub → Gitee
✓ Install command: ./tgo.sh install → ./tgo.sh install --cn
✓ Added China optimization header comments
```

### 幂等性测试

```bash
# 多次运行应产生相同结果
./build-bootstrap.sh
cp bootstrap_cn.sh /tmp/v1.sh
./build-bootstrap.sh
diff bootstrap_cn.sh /tmp/v1.sh
# 应该没有差异
```

### 语法测试

```bash
bash -n bootstrap.sh
bash -n bootstrap_cn.sh
bash -n build-bootstrap.sh
```

## 成果

### ✅ 减少重复

- **之前**: 510 行重复代码需要手动同步
- **之后**: 只需维护 1 个源文件，自动生成变体

### ✅ 降低维护成本

- **之前**: 修改需要同步两个文件，容易出错
- **之后**: 修改一处，自动同步

### ✅ 保持独立性

- 生成的脚本仍然是完全独立的
- 支持 `curl | bash` 远程执行
- 无需额外依赖

### ✅ 自动化

- Git hook 自动触发构建
- 构建过程是幂等的
- 易于验证和测试

## 统计数据

| 指标 | 数值 |
|------|------|
| 源文件行数 | 534 |
| 生成文件行数 | 544 |
| 差异行数 | 24 |
| 重复代码减少 | ~510 行 |
| 构建脚本大小 | 2.3 KB |
| 构建时间 | < 1 秒 |

## 未来改进

### 可能的增强

1. **CI/CD 集成**: 在 GitHub Actions 中验证构建
2. **自动化测试**: 添加功能测试确保两个版本行为一致
3. **更多变体**: 如果需要其他地区的优化版本，可以扩展构建脚本

### 模板系统（备选方案）

如果未来需要更复杂的变体管理，可以考虑：
- 使用模板引擎（如 envsubst、jinja2）
- 创建 `bootstrap.template.sh` 作为主模板
- 使用占位符 `{{VARIABLE}}` 标记差异
- 构建脚本替换占位符生成多个版本

## 相关文档

- [Bootstrap 构建系统](BOOTSTRAP_BUILD_SYSTEM.md)
- [Bootstrap CN 使用指南](BOOTSTRAP_CN_GUIDE.md)
- [中国镜像部署指南](CN_MIRROR_GUIDE.md)
- [主 README](../README.md)

---

**创建日期**: 2024-11-21  
**版本**: v1.0  
**作者**: TGO Team

