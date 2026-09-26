# 北欧版 UI 更新（2026-09-26）

## デザイン

添付モックを視覚基準として、生成りの紙、濃紺、控えめなゴールドへ変更。明るい湖畔のTOP、濃紺のカード選択、生成りの結果・手帳、湖畔のフッターを構成しました。

- 既存のURL、メタデータ、canonical、サイトマップ、記事、カードデータは維持。
- 12枚のシャッフル、扇状配置、スワイプ、キーボード操作、選択アニメーション、結果と手帳の往復は既存スクリプトを使用。
- モックのタロット「正義」、恋愛・仕事別の鑑定文、架空の新着日付、保存機能などは追加していません。
- 月情報は従来どおり「確認中」。背景の空は装飾で、当日の天文情報ではありません。
- 外部フォント・新規ライブラリは追加せず、明朝系のシステムフォントを使用。
- カード画像の `/images/oracle/[slug].webp`、固定比率、contain、既存のSVGフォールバックを維持。

## 主な変更ファイル

- `src/styles/nordic.css`：共通配色、レイアウト、レスポンシブ表示
- `src/styles/global.css`：共通デザイントークン
- `src/layouts/Layout.astro`：スタイル読み込み、ブランド・フッター
- `src/components/MoonJourney.astro`：湖畔背景、TOPのタイトルと導線
- `src/components/OracleExperience.astro`：選択画面の見出し、月装飾、結果の見出し構造
- `src/components/OracleCardBack.astro`：濃紺と金の線画、月・ブランド・番号を維持
- `src/components/CardArt.astro`：既存の線画を新パレットへ調整
- `src/pages/index.astro`：英語装飾を削減
- `src/assets/nordic-lake.png`：背景マスター
- `public/images/nordic-lake.webp`：Web用最適化背景（約131KB）

## 背景画像

生成方式：imagegen スキル／組み込み image_gen（CLI/APIフォールバック不使用）。カード固有の絵は生成していません。生成画像をプロジェクトへコピーし、既存依存のsharpでWebPへ圧縮しました。背景・フッター・カード選択末尾は同じWebPを再利用します。TOP画像は寸法と表示領域を指定し、fetchpriority="high"で読み込みます。

保存先：`src/assets/nordic-lake.png` / `public/images/nordic-lake.webp`

最終プロンプト：

> Use case: photorealistic-natural. Generate a single standalone landscape photographic website background asset, NOT a UI mockup. A quiet Nordic alpine lake in late winter, snow-covered mountain ridges in the distance, dark blue pine forests on the banks, one tiny timber cabin near the left shoreline, still lake with soft reflections. Pale warm ivory overcast sky takes the upper 55% of the composition with ample blank space for Japanese website text to be overlaid later. A very subtle warm pale sun above the mountain horizon. Muted deep navy, slate blue, warm ivory, delicate beige. Natural editorial photography with a soft atmospheric, almost paper-like grain, elegant and tranquil. Wide landscape 3:2 composition; main lake and mountain scenery centered and visible when cropped to a vertical mobile screen, cabin small and off-center. No people, no text, no lettering, no logos, no border, no cards, no phones, no collage. This is the scenic backdrop for a refined Japanese journaling website.

## 確認結果

- `npm run check`：25ファイル、エラー0・警告0・ヒント0。
- `npm run build`：既存の21ページを静的生成。
- 全21ページにH1・canonical・descriptionが各1つ存在。内部ページリンクの参照先とsitemap.xml・robots.txtの生成を確認。
- PC（1280px／1440px）と360px幅でTOP、テーマ・カード選択、結果を確認。ドキュメントの横はみ出しなし。
- 前後ボタン、Enterキー、クリック、上方向のドラッグによる選択を確認。選んだテーマが結果へ反映。
- 結果から手帳へ移動、確認用入力、結果へ戻った際の入力保持、テーマ選択へ戻った際の入力消去を確認。
- `/oracle/`単独ページ、カード詳細ページへの遷移と360px表示を確認。
- 検証中のブラウザーエラーログなし。実機iOS/Androidでのタッチ操作・フレームレート測定は未実施。
- `src/scripts/oracle.ts`、カード・月データ、analytics、既存記事の内容とルート構成は変更前と一致。

### 検証環境の復元

macOSのクラウド上のみとなっていたnode_modulesと.astroキャッシュを作業用バックアップへ退避し、許可された通信で `npm ci` を実行。package-lock.jsonに基づく既存依存を復元しました。package.json・package-lock.jsonの変更、新規依存の追加はありません。
