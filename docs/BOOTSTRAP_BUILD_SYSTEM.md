# Bootstrap 构建系统

## 概述

为了减少 `bootstrap.sh` 和 `bootstrap_cn.sh` 之间的代码重复，我们使用了一个自动化构建系统。该系统从单一源文件（`bootstrap.sh`）生成两个版本的脚本。

## 架构

```
bootstrap.sh (源文件)
     ↓
build-bootstrap.sh (构建脚本)
     ↓
bootstrap_cn.sh (生成文件)
```

### 文件说明

| 文件 | 类型 | 说明 |
|------|------|------|
| `bootstrap.sh` | 源文件 | 国际版 bootstrap 脚本，作为主模板 |
| `bootstrap_cn.sh` | 生成文件 | 中国版 bootstrap 脚本，由构建脚本自动生成 |
| `build-bootstrap.sh` | 构建脚本 | 从 bootstrap.sh 生成 bootstrap_cn.sh |

## 工作原理

`build-bootstrap.sh` 使用 `sed` 对 `bootstrap.sh` 进行以下替换：

1. **头部注释**: 添加中国优化说明
2. **仓库地址**: `https://github.com/tgoai/tgo.git` → `https://gitee.com/tgoai/tgo.git`
3. **安装命令**: `./tgo.sh install` → `./tgo.sh install --cn`
4. **使用说明**: 更新脚本名称引用

## 使用方法

### 修改 Bootstrap 脚本

**重要**: 只需修改 `bootstrap.sh`，然后运行构建脚本：

```bash
# 1. 编辑 bootstrap.sh
vim bootstrap.sh

# 2. 运行构建脚本生成 bootstrap_cn.sh
./build-bootstrap.sh

# 3. 验证生成的文件
bash -n bootstrap_cn.sh
```

### 构建输出示例

```
=== Building Bootstrap Scripts ===
[INFO] Generating bootstrap_cn.sh from bootstrap.sh...
[INFO] Generated bootstrap_cn.sh (544 lines)
[INFO] Setting executable permissions...

=== Build Complete ===
Generated files:
  - bootstrap.sh (534 lines)
  - bootstrap_cn.sh (544 lines)

Differences:
  - 24 lines different

Key changes in bootstrap_cn.sh:
  ✓ Repository: GitHub → Gitee
  ✓ Install command: ./tgo.sh install → ./tgo.sh install --cn
  ✓ Added China optimization header comments
```

## 维护指南

### 添加新功能

1. 在 `bootstrap.sh` 中添加新功能
2. 运行 `./build-bootstrap.sh` 重新生成 `bootstrap_cn.sh`
3. 测试两个脚本

### 修复 Bug

1. 在 `bootstrap.sh` 中修复 bug
2. 运行 `./build-bootstrap.sh` 重新生成 `bootstrap_cn.sh`
3. 验证修复在两个版本中都生效

### 特定于版本的修改

如果需要为某个版本添加特定功能：

**方式 1: 修改构建脚本**（推荐）

在 `build-bootstrap.sh` 中添加新的 `sed` 替换规则：

```bash
sed -e 's|pattern|replacement|' \
    -e 's|new_pattern|new_replacement|' \  # 添加新规则
    bootstrap.sh > bootstrap_cn.sh
```

**方式 2: 手动修改生成文件**（不推荐）

如果手动修改 `bootstrap_cn.sh`，下次运行构建脚本时修改会丢失。

## 验证测试

运行以下命令验证构建系统：

```bash
# 完整验证测试
cat > /tmp/verify_bootstrap.sh << 'EOF'
#!/bin/bash
set -e

cd /path/to/tgo-deploy

# 1. 备份当前文件
cp bootstrap_cn.sh /tmp/bootstrap_cn.sh.backup

# 2. 重新构建
./build-bootstrap.sh

# 3. 比较结果
diff bootstrap_cn.sh /tmp/bootstrap_cn.sh.backup && echo "✓ Idempotent build"

# 4. 语法检查
bash -n bootstrap.sh && echo "✓ bootstrap.sh syntax OK"
bash -n bootstrap_cn.sh && echo "✓ bootstrap_cn.sh syntax OK"

# 5. 关键差异检查
grep -q "github.com" bootstrap.sh && echo "✓ bootstrap.sh uses GitHub"
grep -q "gitee.com" bootstrap_cn.sh && echo "✓ bootstrap_cn.sh uses Gitee"
grep -q "install --cn" bootstrap_cn.sh && echo "✓ bootstrap_cn.sh uses --cn flag"
EOF

chmod +x /tmp/verify_bootstrap.sh
/tmp/verify_bootstrap.sh
```

## 优势

### ✅ 减少重复代码

- 只需维护一个主文件（`bootstrap.sh`）
- 自动生成中国版本，确保功能一致性
- 减少维护成本和出错可能

### ✅ 保持独立性

- 生成的脚本是完全独立的
- 支持 `curl | bash` 远程执行
- 无需额外依赖

### ✅ 易于维护

- 修改一处，自动同步到两个版本
- 构建脚本简单明了
- 易于添加新的替换规则

### ✅ 可验证性

- 构建过程是幂等的（多次运行产生相同结果）
- 可以通过 diff 验证差异
- 语法检查确保生成的脚本有效

## 版本控制

### 提交策略

**选项 1: 提交生成的文件**（当前采用）

```
✓ bootstrap.sh
✓ bootstrap_cn.sh
✓ build-bootstrap.sh
```

**优点**:
- 用户可以直接使用 `curl | bash` 下载脚本
- 无需在服务器上运行构建步骤
- 便于查看两个版本的差异

**缺点**:
- 需要记住运行构建脚本
- Git 历史中包含生成的文件

**选项 2: 只提交源文件**（可选）

```
✓ bootstrap.sh
✗ bootstrap_cn.sh (添加到 .gitignore)
✓ build-bootstrap.sh
```

**优点**:
- Git 历史更清晰
- 强制使用构建系统

**缺点**:
- 需要在部署前运行构建脚本
- 用户无法直接 curl 下载 bootstrap_cn.sh

### 当前策略

我们采用**选项 1**，提交所有文件，因为：
1. 方便用户直接使用
2. 支持 `curl | bash` 远程执行
3. 构建脚本确保一致性

## 常见问题

### Q: 为什么不使用共享函数库？

A: Bootstrap 脚本主要通过 `curl | bash` 远程执行，使用共享库会破坏这种使用模式。单文件独立脚本更适合这个场景。

### Q: 如果忘记运行构建脚本怎么办？

A: 可以在 Git pre-commit hook 中添加检查：

```bash
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached --name-only | grep -q "bootstrap.sh"; then
  echo "bootstrap.sh changed. Running build-bootstrap.sh..."
  ./build-bootstrap.sh
  git add bootstrap_cn.sh
fi
```

### Q: 构建脚本是否支持其他差异？

A: 是的，可以在 `build-bootstrap.sh` 中添加更多 `sed` 规则来处理其他差异。

### Q: 如何验证两个脚本的功能一致性？

A: 除了自动替换的部分（仓库地址、安装命令），其他所有功能应该完全一致。可以通过以下方式验证：

```bash
# 移除已知差异后比较
sed 's|gitee.com|github.com|g; s|install --cn|install|g' bootstrap_cn.sh > /tmp/normalized_cn.sh
diff bootstrap.sh /tmp/normalized_cn.sh
```

## 相关文档

- [Bootstrap CN 使用指南](BOOTSTRAP_CN_GUIDE.md)
- [中国镜像部署指南](CN_MIRROR_GUIDE.md)
- [主 README](../README.md)

---

**创建日期**: 2024-11-21  
**版本**: v1.0

