# 月と手帳

月のリズムとオラクルカードをきっかけに、自分のことばを手帳へ残すための日本語サイトです。AstroとTypeScriptによる静的生成で、生成り・濃紺・ゴールドを基調にした北欧の湖畔のUIを採用しています。

## 実装内容

- TOPと `/oracle/` で共通の12枚のオラクルカード体験
- 6つのテーマ選択、カードのシャッフル、左右ドラッグ・ボタン・キーボード操作、中央カードの選択と反転
- カードのことばと「今日の問い」、問いを引き継ぐ手帳入力画面
- カード一覧・個別ページ、月と手帳のMarkdown記事
- title・description・canonical・OGP、サイトマップとrobots.txt
- モバイル対応、動きを減らす設定への対応

テーマは問いの文脈として表示し、デッキの絞り込みは行いません。章はデータに保持し、結果画面には表示しません。手帳の入力は画面内だけに保持し、サーバー送信や永続保存はしません。カードと手帳の往復では保持し、別テーマへ戻るかページを離れると消えます。

## 開発環境

Node.js 22.12以上（確認環境：24.20）、npmを使用します。依存のバージョンは `package-lock.json` で固定します。

```sh
npm ci
npm run dev
```

開発サーバーのURLはターミナルに表示されます。

```sh
npm run check
npm run build
npm run preview
```

`build` は `dist/` に静的サイトを生成します。`preview` は生成済みサイトのローカル確認用です。必要に応じて `ASTRO_TELEMETRY_DISABLED=1` を指定できます。

## 環境変数

```sh
cp .env.example .env
```

`.env` と環境別の `.env.*` はGit管理対象外です。`.env.example` には公開可能なサンプル値だけを置きます。秘密鍵・APIキーをソースに直接書かないでください。Astroの `PUBLIC_` 接頭辞の変数はブラウザーへ公開されるため、秘密情報には使用しません。

| 変数 | 用途 | 初期状態 |
| --- | --- | --- |
| `SITE_URL` | canonical・OGP・sitemap・robotsの基準URL | `https://example.com` |
| `PUBLIC_GA4_ID` | 任意のGA4測定ID | 未設定・計測無効 |

現在の `astro.config.mjs` は `process.env.SITE_URL` を参照します。サイトを公開するときは、ホスティングのビルド環境変数または以下のようにシェルで実ドメインを設定してください。`.env` への記入だけに依存しないでください。

```sh
SITE_URL=https://your-domain.example npm run build
```

実際の公開ドメイン・ホスティングは未設定です。GitHubへのソース公開とWebサイトのデプロイは別です。ルートパスでの公開を想定しており、GitHub Pagesのリポジトリ配下への公開には別途baseパスの検討が必要です。

GA4を利用するときは `.env` に測定IDを設定し、再ビルドします。未設定の場合、GA4スクリプトの読み込み・イベント送信は行いません。送信パラメーターは定義済みテーマ・カードID・表示位置だけで、手帳の入力は送信しません。自動page_viewは無効です。

## ディレクトリ

```text
src/
  assets/           背景画像のマスター
  components/       月・カード・手帳のUI
  content/articles/ Markdown記事
  data/             カードと月情報
  layouts/          共通レイアウトとSEO
  pages/            ページ・sitemap・robots
  scripts/oracle.ts カード操作と画面遷移
  styles/           共通・体験・北欧UIのスタイル
  utils/analytics.ts 計測処理
public/
  favicon.svg
  images/           最適化背景・カード画像
```

`node_modules/`、`dist/`、`.astro/`、ローカル環境ファイルはコミットしません。

## カードと画像の追加

`src/data/cards.ts` のseedsに、一意のslug、タイトル、章、英語keyword、短文、本文、問いを追加します。IDは配列位置から生成するため、既存順序を変更せず末尾へ追加します。本文の段落は `\n\n` で区切ります。

章は「ひらく」「みつめる」「うごく」「やすむ」の4つ。現在12枚で、36枚すべての原稿は未作成です。個別ページ `/oracle/cards/[slug]/` とサイトマップはデータから生成します。

画像は `public/images/oracle/[slug].webp` に配置して再ビルドします。別形式を使用するときはデータのimageパスも変更します（WebP・PNG・JPG・AVIF）。固定比率24:29、`object-fit: contain` で表示します。未配置時は既存のSVG線画を表示します。正式なカード固有のイラストは未配置です。

湖畔背景は生成画像をWebPへ最適化したものです。マスターは `src/assets/nordic-lake.png`、配信用は `public/images/nordic-lake.webp`。生成方法・プロンプトは [NORDIC-UI.md](NORDIC-UI.md) に記載しています。

## 記事の追加

`src/content/articles/` にMarkdownを追加します。frontmatterには `title`・`description`・`category` を指定します。たとえば `moon/newmoon/calendar.md` は `/moon/newmoon/calendar/` になります。既存固定ページと同じパスは使用しないでください。

## 月情報と未実装項目

月相・月齢・次の新月／満月のデータは未登録で「確認中」と表示します。不正確な独自計算は行いません。背景や月の装飾は当日の天文情報ではありません。日付は日本時間で更新します（JavaScript無効時はビルド時の日付）。データの追加先は `src/data/moon.ts` です。

今後の対象は、出典のある月情報、36枚の原稿・画像、実機での追加検証などです。会員機能・永続保存・広告・OGP画像は未実装です。

## 確認記録

- [NORDIC-UI.md](NORDIC-UI.md)：現在の北欧UIと検証記録
- [V2-PROTOTYPE.md](V2-PROTOTYPE.md)：カード・手帳体験の実装記録
- [MOON-RESEARCH.md](MOON-RESEARCH.md)：正確な月情報の実装候補
- [QA.md](QA.md)：初期MVPの確認記録

公開準備時に `npm run check` と `npm run build` を実行してください。
