# 記事追加テンプレート

以下を新しいMarkdownへコピーし、実際の情報に置き換えます。最初はdraftのまま作成してください。

```yaml
---
title: "記事のタイトル"
description: "実際に本文で答えることの要約"
slug: "journal/your-article"
category: "手帳の書き方"
publishedAt: "2026-09-30"
updatedAt: "2026-09-30"
author: "月と手帳"
image: "journal"
draft: true
featured: false
related: ["journal", "journal/prompts"]
sources: []
---
```

本文はH2から始めます。H1はtitleから、目次はH2から生成します。

カテゴリーは「新月の願い事」「満月の手放し」「手帳の書き方」「オラクルカード」「読みもの」。imageはmedia.tsの登録キーで、現時点ではlake / journal / oracle。

引用・事実に使った一次情報があれば、sourcesに `title` と `url` を設定します。自分たちが実際に記録したことだけを `firsthandNote` に記載してください。出典・経験談・著者の資格は架空の内容で埋めません。

slugは小文字英数字とハイフン、階層区切りの `/`。先頭末尾に `/` は不要です。固定ページとカード個別URLは予約されています。月時刻を掲載する際は日時・タイムゾーン・出典を本文にも明記してください。
