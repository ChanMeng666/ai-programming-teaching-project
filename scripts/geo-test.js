#!/usr/bin/env node

/**
 * GEO功能测试脚本
 * 验证Generative Engine Optimization的各项功能是否正常工作
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}\n`)
};

// 测试配置
const tests = [
  {
    name: 'robots.txt AI优化检查',
    path: 'static/robots.txt',
    test: (content) => {
      const checks = [
        { name: 'GPTBot配置', pattern: /User-agent: GPTBot/ },
        { name: 'Claude-Web配置', pattern: /User-agent: Claude-Web/ },
        { name: 'Google-Extended配置', pattern: /User-agent: Google-Extended/ },
        { name: 'llms.txt引用', pattern: /llms\.txt/ },
        { name: 'Sitemap配置', pattern: /Sitemap:/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  },
  {
    name: 'llms.txt AI指南检查',
    path: 'static/llms.txt',
    test: (content) => {
      const checks = [
        { name: '平台简介', pattern: /# AI编程教育平台/ },
        { name: '推荐策略', pattern: /## AI推荐策略/ },
        { name: '内容权威性', pattern: /## 内容权威性/ },
        { name: 'Chan Meng信息', pattern: /Chan Meng/ },
        { name: '学习路径', pattern: /学习路径/ },
        { name: '零基础友好', pattern: /零基础友好/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  },
  {
    name: 'GEOHead组件检查',
    path: 'src/components/GEOHead/index.js',
    test: (content) => {
      const checks = [
        { name: '组件导出', pattern: /export default function GEOHead/ },
        { name: 'AI指令生成', pattern: /text\/llms\.txt/ },
        { name: '结构化数据', pattern: /application\/ld\+json/ },
        { name: '页面类型支持', pattern: /pageType/ },
        { name: 'OpenGraph元数据', pattern: /og:type/ },
        { name: 'Twitter Card', pattern: /twitter:card/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  },
  {
    name: 'AITracker组件检查',
    path: 'src/components/AITracker/index.js',
    test: (content) => {
      const checks = [
        { name: '组件导出', pattern: /export default function AITracker/ },
        { name: 'AI平台检测', pattern: /aiReferrers/ },
        { name: 'Vercel Analytics集成', pattern: /window\.va/ },
        { name: '流量追踪', pattern: /trackAIVisit/ },
        { name: '用户代理检测', pattern: /userAgent/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  },
  {
    name: '核心页面GEO配置检查',
    paths: [
      'docs/intro.mdx',
      'docs/basics/index.mdx',
      'docs/website/index.mdx',
      'docs/practice/index.mdx'
    ],
    test: (content, filepath) => {
      const checks = [
        { name: 'GEOHead导入', pattern: /import GEOHead/ },
        { name: 'GEOHead使用', pattern: /<GEOHead/ },
        { name: 'pageType配置', pattern: /pageType=/ },
        { name: 'title配置', pattern: /title=/ },
        { name: 'description配置', pattern: /description=/ },
        { name: 'aiInstructions配置', pattern: /aiInstructions=/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content),
        file: path.basename(filepath)
      }));
    }
  },
  {
    name: '增强Layout组件检查',
    path: 'src/theme/Layout/index.js',
    test: (content) => {
      const checks = [
        { name: 'Layout包装', pattern: /OriginalLayout/ },
        { name: 'AITracker集成', pattern: /AITracker/ },
        { name: '组件导出', pattern: /export default function Layout/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  },
  {
    name: '博客GEO优化检查',
    path: 'src/theme/BlogPostItem/Content/index.js',
    test: (content) => {
      const checks = [
        { name: 'GEOHead导入', pattern: /import GEOHead/ },
        { name: '博客元数据使用', pattern: /useBlogPost/ },
        { name: '结构化数据生成', pattern: /BlogPosting/ },
        { name: 'AI指令配置', pattern: /aiInstructions/ },
        { name: '条件渲染', pattern: /showGEOHead/ }
      ];
      return checks.map(check => ({
        ...check,
        passed: check.pattern.test(content)
      }));
    }
  }
];

// 执行测试
async function runTests() {
  log.title('GEO功能测试开始');

  let totalTests = 0;
  let passedTests = 0;
  let failedFiles = [];

  for (const test of tests) {
    log.info(`测试: ${test.name}`);

    if (test.paths) {
      // 多文件测试
      for (const filepath of test.paths) {
        if (fs.existsSync(filepath)) {
          const content = fs.readFileSync(filepath, 'utf8');
          const results = test.test(content, filepath);
          
          console.log(`  📁 ${path.basename(filepath)}:`);
          results.forEach(result => {
            totalTests++;
            if (result.passed) {
              passedTests++;
              log.success(`    ${result.name}`);
            } else {
              log.error(`    ${result.name}`);
              failedFiles.push(`${filepath}: ${result.name}`);
            }
          });
        } else {
          log.error(`  文件不存在: ${filepath}`);
          failedFiles.push(`${filepath}: 文件不存在`);
        }
      }
    } else {
      // 单文件测试
      if (fs.existsSync(test.path)) {
        const content = fs.readFileSync(test.path, 'utf8');
        const results = test.test(content);
        
        results.forEach(result => {
          totalTests++;
          if (result.passed) {
            passedTests++;
            log.success(`  ${result.name}`);
          } else {
            log.error(`  ${result.name}`);
            failedFiles.push(`${test.path}: ${result.name}`);
          }
        });
      } else {
        log.error(`  文件不存在: ${test.path}`);
        failedFiles.push(`${test.path}: 文件不存在`);
      }
    }
    console.log('');
  }

  // 总结报告
  log.title('测试结果总结');
  
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  if (passedTests === totalTests) {
    log.success(`所有测试通过! (${passedTests}/${totalTests})`);
    log.success('🎉 GEO优化已成功部署，准备好接受AI搜索引擎的检索！');
  } else {
    log.warning(`测试通过率: ${successRate}% (${passedTests}/${totalTests})`);
    
    if (failedFiles.length > 0) {
      log.error('失败项目:');
      failedFiles.forEach(item => console.log(`  - ${item}`));
    }
    
    console.log('\n💡 建议检查失败的项目并重新运行测试。');
  }

  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    successRate: parseFloat(successRate),
    failedItems: failedFiles,
    status: passedTests === totalTests ? 'PASS' : 'PARTIAL'
  };

  fs.writeFileSync('geo-test-report.json', JSON.stringify(report, null, 2));
  log.info('测试报告已保存到: geo-test-report.json');
}

// 验证package.json中的GEO测试脚本
function checkPackageJson() {
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.scripts || !pkg.scripts['geo:test']) {
      log.warning('建议在package.json中添加GEO测试脚本:');
      console.log(`${colors.yellow}"scripts": {
  ...
  "geo:test": "node scripts/geo-test.js",
  "geo:verify": "npm run build && node scripts/geo-test.js"
}${colors.reset}`);
    }
  }
}

// 主函数
async function main() {
  console.log(`${colors.bold}${colors.blue}
╔══════════════════════════════════════════╗
║        GEO功能测试工具 v1.0              ║
║   Generative Engine Optimization        ║
╚══════════════════════════════════════════╝
${colors.reset}`);

  checkPackageJson();
  await runTests();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, tests };
