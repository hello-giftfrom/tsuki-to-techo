# 月と手帳 v0.2

「月をしるべに、わたしを知る。」北欧のWebマガジンと、カードのことばを手帳へ持ち帰るための小さなオラクル体験。Astro / TypeScriptによる静的サイトです。

## v0.2の内容

- 湖畔の大きなビジュアル、4つの入口、新着記事、編集部おすすめ、ブランド紹介を備えたTOP。
- テーマ選択を経ず、同じ裏面の5枚から選ぶオラクル。配るたびに36枚をシャッフルします。
- 結果はカード画像・名前・keyword → 短いことば → メッセージ → 手帳への問い。再ドローは控えめなリンクボタン。
- 正式な4章・各9枚。章・IDは内部データで、カードに番号は表示しません。
- Markdown記事6本、目次、関連記事、著者名・日付・出典欄、SEO metadata / JSON-LD。
- ログイン・履歴保存・テーマ別分岐・未確認の月情報はありません。

## 開発・確認

Node.js 22.12以上、npmを使用します。依存はlockfileで固定し、v0.2では追加していません。

```sh
npm ci
npm run dev
npm run check
npm run build
python3 scripts/check-site.py
node scripts/check-oracle.mjs
npm run preview
```

`dist/` に46ページを出力します。検証スクリプトは生成HTML、内部リンク、画像、目次、JSON-LD、サイトマップとリダイレクトを確認します。記事数を増やす際はスクリプト内の期待件数も更新してください。ブラウザーの視覚確認を代替するものではありません。

## ブラウザー確認

通常のターミナルから `bash scripts/check-browser.sh` を実行すると、PC 1440px・スマートフォン390px/360px/320pxのTOP、カード選択、結果、記事、読みものを確認し、`qa-output/` に画面と結果JSONを保存します。カードのキーボード操作、再ドロー、画像欠け、横はみ出しに加え、全36枚の結果本文とスマホの縦一列配置も検証します。

これは開発用の外部Playwrightを使い、プロジェクト依存には追加しません。現在の環境ではCodexの共有ランタイムと `/private/tmp/tsuki-browser` に取得したブラウザーを使用します。他の環境では `PLAYWRIGHT_MODULE` と `PLAYWRIGHT_BROWSERS_PATH` を設定してください。先に `npm run build` を実行してください。スクリプト自身がローカルの空きポートで配信を開始・終了します。結果ファイルはGit管理外です。

## 公開・Cloudflare Pages

既存の `astro.config.mjs` とビルドコマンドを維持しています。Cloudflare Pagesの静的配信を想定し、ビルドは `npm run build`、出力は `dist`。管理画面側の設定や本番デプロイは今回変更・検証していません。

| 変数 | 用途 |
| --- | --- |
| `SITE_URL` | canonical・OGP・sitemap・robotsの公開ドメイン。未指定時は `https://example.com` |
| `PUBLIC_GA4_ID` | 任意のGA4測定ID。未指定時は計測しません |

`astro.config.mjs` は `process.env.SITE_URL` を参照します。Cloudflareのビルド環境変数を確認してください。`.env` への記入だけには依存しません。

```sh
SITE_URL=https://your-domain.example npm run build
```

GA4はカードIDと表示位置だけを対象とし、自動page_viewは無効です。秘密情報を `PUBLIC_` 変数に入れないでください。`.env` / `node_modules` / `dist` / `.astro` はGit管理外です。

`public/_redirects` を出力へ同梱し、旧 `/moon/` と旧新月・満月記事、旧カード一覧を301転送します。カード個別URLは維持しています。Astro previewや一般のローカルHTTPサーバーはCloudflareの `_redirects` を適用しません。

## 主なファイル

| ファイル | 内容 |
| --- | --- |
| `src/pages/index.astro` | TOP |
| `src/components/OracleExperience.astro` | 5枚の選択画面 |
| `src/components/OracleResult.astro` | 結果・手帳への問い |
| `src/scripts/oracle.ts` | シャッフル、フリップ、再ドロー |
| `src/data/cards.ts` | 36枚のデータ |
| `src/data/media.ts` | 共通画像パス・将来のSNSリンク |
| `src/styles/global.css` | 色、余白、レスポンシブUI |
| `src/content.config.ts` | 記事の型と検証 |
| `src/content/articles/` | 記事Markdown |
| `src/layouts/ArticleLayout.astro` | 記事・目次・関連記事・BlogPosting |
| `src/layouts/Layout.astro` | ナビ・フッター・共通SEO |

## カード画像の差し替え

2026-10-10に、36枚すべてをユーザー提供ZIPの個別WebP画像（512×512px）へ差し替えました。各カードの `public/images/oracle/[slug].webp` は実在するファイルです。正式画像へ置き換えて再ビルドすると、そのカードだけ差し替わります。例：余白は `public/images/oracle/yohaku.webp`。

個別画像は正方形1:1、`object-fit: contain`。共通の仮画像へ戻る場合の画像枠は従来の2:3です。スマホでは本文幅の76%・最大280pxで中央に置き、その下にカード名、keywordを表示します。共通仮画像と同じファイル内容の場合は「共通の仮イラスト」と表示し、別の画像に交換するとラベルも自動で外れます。未配置・読み込み失敗時は共通画像へ戻ります。PNG/JPG/AVIFを使う場合はimageパスも変更してください。

共通画像は `src/data/media.ts` で管理します。新たな画像生成や一覧画像からの切り出しは行っていません。既存の生成画像の記録は [docs/IMAGES.md](docs/IMAGES.md) を参照。

カード本文は `src/data/cards.ts` の36個のオブジェクトで管理します。IDは明示的な数値として固定し、slug・正式タイトル・keyword・章を維持しています。本文フィールドは `affirmation`（短い肯定文）、`message`（受容から始まる本文）、`cardMessage`（補足のメッセージ）、`journalPrompt`（問い一つ）。章は内部分類です。

前回の本文・UI変更と当時の仮画像一覧は [docs/ORACLE-RESULT-UPDATE.md](docs/ORACLE-RESULT-UPDATE.md) を参照してください。

## 記事の追加

1. [docs/article-template.md](docs/article-template.md) のfrontmatterを参考に `src/content/articles/` へMarkdownを追加。
2. `slug` が公開URLになります。ファイルの保存階層とは独立しています。
3. `title`、`description`、`slug`、`category`、`publishedAt`、`author`、`image` を指定。`updatedAt` は任意。
4. `related` は記事のslugを指定。重複slug、予約済みURL、存在しない関連記事、公開日より前の更新日はビルドでエラーになります。
5. `draft: true` は一覧・個別ページ・サイトマップから除外。公開時にfalseへ。
6. `featured: true` は「今、読んでほしい読みもの」への手動推薦。アクセス数ランキングではありません。

新着記事は公開日降順。imageには `lake` / `journal` / `oracle` のキーを指定します。新しい写真はmediaと記事schemaのimage候補に追加してください。SNSリンクはmedia.tsのsocialsへ実在するURLだけを設定します。

出典は `sources`、実際の一次記録は `firsthandNote` で掲載できます。ない情報を生成して補わないでください。著者は現在「月と手帳」名義のOrganization。個人を追加するときはschema・表示を合わせて更新します。

## 月情報とサンプル記事

天文計算や未検証の新月・満月時刻は実装していません。新月記事のカレンダー・星座・次回日時は内部TODOです。確認できる情報がそろうまでは見出しやtitleでもカレンダーを提供すると約束しません。背景の月は天文情報ではありません。

6本の記事は編集用の初期原稿です。公開・更新日はv0.2作業日を設定しています。実公開時には本文と公開日を確認してください。

## 作業記録

- [docs/V0.2-REPORT.md](docs/V0.2-REPORT.md)：変更一覧、検証結果、残る確認事項
- [MOON-RESEARCH.md](MOON-RESEARCH.md)：将来の正確な月情報の実装候補
- `NORDIC-UI.md`、`V2-PROTOTYPE.md`、`QA.md` は旧版の履歴です。現在の仕様はこのREADMEとv0.2レポートを参照してください。
