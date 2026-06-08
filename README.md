# LuminaSearch (搜索结果美化插件)

[English](./README_en.md) | 简体中文

LuminaSearch 用于优化和美化搜索引擎的页面布局。提供了一个更整洁、视觉更惊艳的搜索体验。

## 效果演示

*以下是优化后的搜索界面示例：*

![示例图 1 - 必应单列布局](./exp/bing.png)

![示例图 2 - 百度单列布局](./exp/baidu.png)

![示例图 3 - 谷歌单列布局](./exp/google.png)

## 核心功能
- **单列居中布局**
- **双列居中布局**
- **护眼模式**
- **自动翻页**

## 环境需求
如果您希望在本地编译和开发此项目，需要具备以下环境：
- 操作系统中已安装 **Bun** 或 **NodeJS**。
- 一款支持 Chromium/WebExtensions API 的现代浏览器（如 Google Chrome, Microsoft Edge, Brave 等）。

## 权限需求
为了让插件正常工作，在浏览器中安装时需要以下权限：
- **主机权限 (Host Permissions)**：用于在搜索页面中注入自定义布局脚本和 CSS 样式。
- **存储权限 (Storage)**：用于保存您的插件偏好设置和布局选项。

## 快速开始
1. 克隆此代码库到本地。
2. 运行 `bun install` 或 `npm install` 安装依赖。
3. 运行 `bun run build` 或 `npm run build` 编译打包项目。
4. 在浏览器的“扩展程序”管理页面中，开启“开发者模式”，并加载编译后生成的 `dist` 文件夹。
