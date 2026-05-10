# AI 接口文档

> 搭子用到的 AI 能力和 API 调用方式

## 通义千问多模态（DashScope）

用于衣物识别和穿搭推荐。

**衣物识别 Prompt 示例：**
```
请识别这张图片中的服装，返回 JSON 格式：
{ category, color, style, season }
```

**搭配推荐 Prompt 示例：**
```
用户衣橱：[衣物列表]
场景：通勤上班
请推荐一套搭配，返回 JSON 格式：
{ top, bottom, shoes, accessories, reason }
```

## 抖音视频解析

复用 references/demo1-video-parse，从视频链接提取关键帧。

## 相关链接

- DashScope API 文档：?
- 抖音开放平台：?
