# Voice Gen — ElevenLabs Alternative

## 竞品信息

| 项目 | 值 |
|------|-----|
| 对标竞品 | ElevenLabs |
| 竞品 URL | https://elevenlabs.io |
| 预估月流量 | 50M+ |
| 定价模式 | Freemium (10,000 chars/month free, then $5-$330/month) |

## 核心功能（必做）

1. **Text to Speech** — 将文本转换为自然语音，支持多种声音
2. **多语言支持** — 支持英语、中文、日语等主要语言
3. **Voice Selection** — 提供多种声音选择
4. **Download Audio** — 支持下载生成的音频文件

## 差异化定位

- ✅ 免费使用（每天 10 次免费）
- ✅ 无需注册即可试用
- ✅ 简洁易用的界面
- ✅ 比竞品更便宜 50%+

## 用户痛点（我们要解决的）

| 痛点 | 来源 | 我们的方案 |
|------|------|-----------|
| 价格太贵 | Reddit r/ElevenLabs | 免费 + 超低价套餐 |
| Credits 消耗太快 | G2 Reviews | 更慷慨的免费额度 |
| 需要注册 | 用户反馈 | 无需注册即可试用 |
| 速度控制不好 | Reddit | 提供速度滑块控制 |

## 截流关键词

### Primary（首页 SEO）
- `ElevenLabs alternative`
- `ElevenLabs free`
- `free text to speech`

### Secondary（独立页面）
- `ElevenLabs vs Voice Gen`
- `best ElevenLabs alternatives 2026`
- `free AI voice generator`

### Long-tail（Programmatic SEO）
- `ElevenLabs alternative no signup`
- `ElevenLabs alternative free unlimited`
- `text to speech like ElevenLabs`
- `ElevenLabs alternative for YouTube`
- `ElevenLabs alternative for podcasts`

## 技术方案

- 前端：React + Vite (TypeScript)
- 后端：Python FastAPI
- TTS API：OpenAI TTS + Web Speech API fallback
- 部署：Docker → langsheng
- 域名：`voice-gen.demo.densematrix.ai`

## 端口分配

- Frontend: 30090
- Backend: 30091

## 完成标准

- [x] 核心功能可用
- [ ] 部署到 voice-gen.demo.densematrix.ai
- [ ] SEO 截流关键词已覆盖
- [ ] Health check 通过
