# Algolia搜索功能完整配置指南

## 问题诊断

你遇到的400错误通常是由以下原因引起的：
1. API密钥权限问题
2. 索引配置问题
3. CORS设置问题
4. 搜索参数不匹配

## 解决方案

### 1. 验证Algolia配置（已完成）

我已经更新了 `docusaurus.config.js` 中的Algolia配置：
- 简化了搜索参数
- 禁用了contextualSearch（避免版本过滤问题）
- 添加了中文翻译

### 2. 在Algolia控制台检查以下设置

登录到你的Algolia控制台，检查：

#### A. API密钥权限
1. 进入 Settings > API Keys
2. 确认Search API Key (f70da822145b6159e198fc85147e0564) 有以下权限：
   - search
   - browse
   - listIndexes

#### B. 索引配置
1. 进入你的索引 `ai-programming-crawler`
2. 点击 Configuration > Searchable attributes
3. 确保以下属性被设置为可搜索：
   - content
   - hierarchy.lvl0
   - hierarchy.lvl1
   - hierarchy.lvl2
   - hierarchy.lvl3
   - hierarchy.lvl4
   - hierarchy.lvl5
   - hierarchy.lvl6

#### C. Facets配置
1. 在同一个Configuration页面
2. 点击 Facets
3. 添加以下facets：
   - lang
   - docusaurus_tag
   - type
   - version

#### D. 查询设置
1. 点击 Configuration > Query Suggestions
2. 确保以下设置：
   - removeStopWords: false（或设置为中文）
   - queryType: prefixLast
   - typoTolerance: true

### 3. 添加CORS配置

在Algolia控制台：
1. 进入 Settings > Allowed referrers
2. 添加你的网站域名：
   - https://programming.chanmeng.org
   - https://ai-programming-teaching-project.pages.dev
   - http://localhost:3000（用于本地测试）

### 4. 重新爬取内容（如果需要）

如果上述步骤都没问题，可能需要重新爬取：
1. 进入 Crawler > ai-programming-crawler
2. 点击 "Start Crawling" 重新爬取内容

### 5. 测试搜索功能

#### 本地测试：
```bash
npm run serve
```
然后访问 http://localhost:3000 测试搜索

#### 使用curl测试API：
```bash
curl -X POST \
  https://8VHXTP609D-dsn.algolia.net/1/indexes/ai-programming-crawler/query \
  -H 'X-Algolia-API-Key: f70da822145b6159e198fc85147e0564' \
  -H 'X-Algolia-Application-Id: 8VHXTP609D' \
  -H 'Content-Type: application/json' \
  -d '{"query":"教程"}'
```

### 6. 如果仍然有问题

可以尝试以下替代方案：

#### 方案A：使用Algolia DocSearch免费服务
1. 申请 DocSearch: https://docsearch.algolia.com/apply/
2. 等待批准后会获得新的配置

#### 方案B：创建新的搜索索引
1. 在Algolia创建新索引
2. 使用以下脚本手动索引内容：

```javascript
// scripts/indexToAlgolia.js
const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');

const client = algoliasearch('8VHXTP609D', 'YOUR_ADMIN_API_KEY');
const index = client.initIndex('ai-programming-crawler');

// 索引逻辑...
```

### 7. 推荐的最终配置

如果以上步骤都完成后仍有问题，可以使用这个最简化的配置：

```javascript
algolia: {
  appId: '8VHXTP609D',
  apiKey: 'f70da822145b6159e198fc85147e0564',
  indexName: 'ai-programming-crawler',
  // 移除所有可选参数，使用默认值
}
```

## 验证步骤

1. 清除浏览器缓存
2. 重新部署到Cloudflare Pages
3. 等待几分钟让CDN更新
4. 测试搜索功能

## 联系支持

如果问题持续存在：
1. 检查浏览器控制台的具体错误信息
2. 联系Algolia支持团队
3. 考虑使用其他搜索解决方案（如本地搜索插件）