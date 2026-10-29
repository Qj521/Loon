# X 去广告（Loon 测试版）

## 重要说明
Loon 的插件配置通常通过 `script-path` 引用脚本，因此单独的 `.plugin` 文件不能把这段 JavaScript 真正内嵌进去。本项目提供插件配置和 JS 两个文件；上传到公开 GitHub 仓库后，把插件里的占位符换成你的用户名和仓库名。

## 文件
- `X-Ad-Filter.plugin`：Loon 插件配置
- `x_remove_ads.js`：响应处理脚本

## 使用
1. 将两个文件上传到同一个 GitHub 仓库的 `main` 分支根目录。
2. 编辑 `X-Ad-Filter.plugin`，把 `YOUR_USERNAME/YOUR_REPO` 换成实际用户名/仓库名。
3. 在 Loon 中通过插件 URL 导入：
   `https://raw.githubusercontent.com/你的用户名/你的仓库名/main/X-Ad-Filter.plugin`
4. 启用插件并测试 X 信息流。若出现加载异常、内容缺失或转圈，立即停用插件。

## 限制
- 这是未实机验证的原型，不保证覆盖所有广告类型。
- 仅在响应是可解析 JSON 时尝试修改；解析失败时保持原响应。
- X 的 GraphQL 接口和字段可能变化，后续需根据实际响应调整。
