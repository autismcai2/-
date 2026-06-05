# 拼豆库存管理系统

一个本地优先、可接入 Supabase 云存储的拼豆库存管理系统，适合拼豆爱好者日常管理色号库存、图纸消耗、补货记录和库存预警。

## 功能概览

- `Dashboard` 首页总览
  - 总色号数量
  - 总库存数量
  - 低库存数量
  - 图纸数量
  - 最近补货和图纸动态
- `色库管理`
  - 默认 `MARD 221`
  - 221 个色号完整内置
  - 按系列分组展示
  - 库存、预警值支持单独修改
- `库存预警`
  - 只显示低库存和缺货
  - 缺货逻辑会结合待拼图纸需求
  - 自动生成补货建议
- `补货记录`
  - 单条补货
  - 批量导入补货
  - 补货会实时联动库存
  - 同一批次记录会分组显示
- `图纸中心`
  - 状态支持：`待拼`、`进行中`、`完成不扣库存`、`完成并扣库存`
  - 支持上传图纸封面
  - 图纸详情支持修改用豆明细
  - 完成并扣库存时自动减少库存
- `系统设置`
  - 默认预警值
  - 当前默认色库
  - 管理员密码
  - 清空库存 / 清空已完成图纸 / 清空未完成图纸
- `登录保护`
  - 前端轻量管理员密码
  - 默认密码：`admin123`

## 当前技术形态

这是一个静态前端项目：

- `index.html`
- `styles.css`
- `app.js`

默认可以直接本地打开使用。  
如果配置了 Supabase，就会把数据同步到云端，换设备也能继续使用。

## 目录说明

- [index.html](/c:/Users/Aliencell/Desktop/new/index.html)
- [styles.css](/c:/Users/Aliencell/Desktop/new/styles.css)
- [app.js](/c:/Users/Aliencell/Desktop/new/app.js)
- [supabase-config.js](/c:/Users/Aliencell/Desktop/new/supabase-config.js)
- [supabase-setup.sql](/c:/Users/Aliencell/Desktop/new/supabase-setup.sql)

## 本地使用

### 1. 直接打开

直接双击 `index.html` 就可以打开。

### 2. 首次登录

首次进入需要管理员密码：

- 默认密码：`admin123`

进入后可以在“系统设置”里修改密码。

### 3. 本地存储说明

如果没有接入 Supabase，数据会保存在当前浏览器的 `localStorage` 里。

这意味着：

- 同一台电脑、同一个浏览器里，刷新后数据还在
- 换浏览器、换电脑、清浏览器缓存后，数据可能丢失
- 朋友在别的地方打开同一个网址时，不会自动看到你的本地数据

## Supabase 云存储接入

如果你希望：

- 数据长期保存
- 多设备同步
- Render 部署后在线可用

那就需要配置 Supabase。

### 1. 在 Supabase 创建项目

进入 Supabase 后：

1. 创建一个新项目
2. 等数据库初始化完成

### 2. 执行 SQL 初始化

打开 Supabase 后台的 SQL Editor，把 [supabase-setup.sql](/c:/Users/Aliencell/Desktop/new/supabase-setup.sql) 整个内容复制进去执行。

它会创建：

- `public.app_state` 表
- `pattern-covers` 存储桶
- 对应的公开读写策略

### 3. 找到项目 URL 和 Key

进入 Supabase 项目后台：

1. 点左下角 `Project Settings`
2. 找 `API`

你需要两个值：

- `Project URL`
- `Publishable key`

注意：

- 这里用的是 `Publishable key`
- 不是 `secret key`
- 也不是带 `/rest/v1/` 的 REST 地址

正确 URL 例子：

```txt
https://your-project.supabase.co
```

错误例子：

```txt
https://your-project.supabase.co/rest/v1/
```

### 4. 修改 supabase-config.js

打开 [supabase-config.js](/c:/Users/Aliencell/Desktop/new/supabase-config.js)，填入你的值：

```js
window.SUPABASE_CONFIG = {
  url: "https://your-project.supabase.co",
  anonKey: "你的 Publishable key",
  stateKey: "default",
  storageBucket: "pattern-covers"
};
```

### 5. 部署后效果

配置成功后：

- 页面会优先从 Supabase 加载数据
- 每次修改库存、补货、图纸、设置时会同步保存到 Supabase
- 图纸封面会上传到 `pattern-covers` 存储桶

## Render 静态部署

这个项目适合用 Render 的 `Static Site` 部署。

### 1. 先推送到 GitHub

如果项目已经在本地：

```bash
git init
git add .
git commit -m "init project"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

如果后续有更新：

```bash
git add .
git commit -m "update project"
git push
```

### 2. 在 Render 创建静态站点

进入 Render 后：

1. 点 `New +`
2. 选 `Static Site`
3. 连接 GitHub 仓库
4. 选择这个项目仓库

### 3. Render 配置建议

- `Build Command`：留空
- `Publish Directory`：`.`

因为这是纯静态项目，不需要打包。

### 4. 部署完成

部署成功后，Render 会给你一个网址，例如：

```txt
https://your-site.onrender.com
```

如果已经接好 Supabase，线上就会直接使用云端数据。

## Render + Supabase 的推荐搭配

推荐方式：

- 前端页面部署在 Render
- 数据和图片存储放在 Supabase

这样即使 Render 是静态托管，数据也不会因为刷新页面而丢失。

## GitHub Actions 自动请求保活

项目里已经包含：

- [.github/workflows/keepalive.yml](/c:/Users/Aliencell/Desktop/new/.github/workflows/keepalive.yml)

作用：

- 每天请求一次 Render 页面
- 每天请求一次 Supabase `app_state` 接口

### GitHub 里要配置的 Secrets

进入 GitHub 仓库：

1. 点 `Settings`
2. 点左侧 `Secrets and variables`
3. 点 `Actions`
4. 点 `New repository secret`

添加下面这些：

#### 1. RENDER_SITE_URL

填你的 Render 地址，例如：

```txt
https://bead-inventory.onrender.com/
```

#### 2. SUPABASE_URL

填 Supabase 项目根地址，例如：

```txt
https://your-project.supabase.co
```

不要写成：

```txt
https://your-project.supabase.co/rest/v1/
```

#### 3. SUPABASE_PUBLISHABLE_KEY

填 Supabase 后台 API 里的：

- `Publishable key`

#### 4. SUPABASE_STATE_KEY

如果你保持默认，就填：

```txt
default
```

### 手动测试一次

Secrets 配好后：

1. 打开 GitHub 仓库
2. 点 `Actions`
3. 选择 `Keepalive`
4. 点 `Run workflow`

如果执行成功，说明自动请求已经生效。

## 常见问题

### 1. 页面只有导览，内容是空白的

先检查：

- `supabase-config.js` 有没有部署上去
- `url` 是否写成了根地址
- 是否错误写成了 `/rest/v1/`

正确：

```js
url: "https://your-project.supabase.co"
```

错误：

```js
url: "https://your-project.supabase.co/rest/v1/"
```

### 2. Supabase key 应该填哪个

填：

- `Publishable key`

不要填：

- `Secret key`

### 3. 为什么我本地有数据，朋友打开没有

因为没接 Supabase 时，数据保存在你的浏览器本地。

只有配置 Supabase 后，其他设备才能看到同一份数据。

### 4. 图纸封面上传后存在哪里

- 没接 Supabase：存在浏览器本地
- 接了 Supabase：上传到 `pattern-covers` 存储桶

### 5. 管理员密码忘了怎么办

目前这个登录保护是前端轻量版，密码保存在应用数据里。

如果你还能进系统，可以在“系统设置”修改。  
如果你已经完全进不去，可以临时清除本地数据，或者直接去 Supabase 里改 `app_state` 的内容。

### 6. Render 休眠会不会影响数据

这个项目是静态站点，核心数据存储不在 Render，而在 Supabase。

所以即使 Render 页面有冷启动，只要页面能打开，数据仍然会从 Supabase 读取。  
Supabase 不需要依赖 Render 保活。

### 7. 能不能自动防止 Supabase 因无活动暂停

可以通过 GitHub Actions 定时请求来尽量保持活动。

当前项目已经内置这个流程：

- 每天请求一次 Render
- 每天请求一次 Supabase `app_state`

但要注意：

- 这更像保活方案，不是 Supabase 官方对免费版“不暂停”的承诺
- 如果你希望长期稳定不被 pause，更稳的方案仍然是升级 Supabase 付费计划

## 补货和库存联动规则

### 单条新增补货

```txt
Color.stock += RestockRecord.quantity
```

### 编辑补货

```txt
Color.stock += newQuantity - oldQuantity
```

### 删除补货

```txt
Color.stock -= oldQuantity
```

## 图纸扣库存规则

图纸状态支持四种：

- `todo` 待拼
- `doing` 进行中
- `done` 完成不扣库存
- `done-deducted` 完成并扣库存

当图纸进入 `done-deducted` 时：

```txt
Color.stock -= PatternItem.quantity
```

并且通过 `stockDeducted` 防止重复扣库存。

## 库存预警规则

### 低库存

当：

```txt
stock <= warningThreshold
```

即视为低库存。

### 缺货

缺货会结合待拼图纸的需求量计算。

### 建议补货量

建议补货量按 1000 为基数向上取整。

## 推荐维护流程

日常更新代码时：

```bash
git add .
git commit -m "describe update"
git push
```

Render 会自动重新部署。

## 后续可扩展方向

- Excel / CSV 导入导出
- AI 图纸识别
- 多用户
- 更细粒度权限
- 数据分析报表
- PWA

---

如果你后面还要，我也可以继续帮你把这份 README 改成更像“交付文档”的版本，比如加上界面截图、操作流程图、常见操作示例。
