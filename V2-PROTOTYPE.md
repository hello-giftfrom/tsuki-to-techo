# 月と手帳 V2 — 動くプロトタイプ

## 実装した体験

- TOPを夜の月、今日の月、紙のページ、オラクルへ続く4場面に変更。
- 月だけがゆっくり呼吸し、通常スクロールに連動して縮小・移動。画面外では呼吸を停止。
- 12枚の既存カードを初期化時にシャッフル。扇状に重なる裏面と、中央へ近づくほど持ち上がる奥行き。
- Pointer Eventsによる左右ドラッグと減衰する慣性。中央カードをタップ、または約80px上へ動かして離すと選択。
- 他のカードが退場し、約0.5秒の間を置いて約1秒かけて反転。その後、カード本文を表示。
- 6種類のSVG線画をカードデータに割り当て。生成AI画像・外部画像は使用していない。
- 結果の問いを、その場で紙の手帳UIへ引き継ぐ。入力してカードに戻ることも可能。
- 既存12枚の個別ページへアートと関連カードを追加。余白の本文を約300文字へ拡充。

## UI/UXの意図

夜から紙へ色と質感を変え、文章は静かに読める状態を保つ。動く対象は月、カード、紙に絞った。中央カードの内側だけ上方向ジェスチャーを予約し、それ以外の場所は通常スクロールする。スクロール位置の強制スナップやホイールの横取りはしない。

ドラッグ以外にも左右ボタン、矢印キー、Home/End、Enter/Spaceを用意。結果見出し、手帳見出し、戻る先へフォーカスを移す。reduced-motionでは月の呼吸・パララックス・紙の開き・大きな移動を止め、カード反転の待機を省略する。

## 手帳UIについて

書き込みは画面内の一時的な入力。サーバー送信、localStorage、永続保存は行わない。カードと手帳を往復する間は保持し、別テーマへ戻る・ページを離れると破棄する。入力欄のそばにも明示。入力文や問いをGA4へ送らない。

## データと画像

既存の `title` はname、`keyword` はenglishName、`message` はbodyに相当。`shortMessage`, `journalPrompt`, `slug`, `image`, `chapter`, `id` を継続し、SVGの種類を指定する `artwork` を追加した。UI内にカード本文を直書きしていない。

正式画像は従来どおり `public/images/oracle/[slug].webp` へ配置して再ビルド。画像がない場合は6種類のSVGアートを表示。画像領域は24:29、外枠は縦長。画像はcontainで全体表示し、width/height・aspect-ratioで領域を確保。通常はlazy loading、選択カードは反転時にeagerへ切り替える。

## SEOの維持

- 既存21ページのURLを継続。カード個別ページは `/oracle/cards/[slug]/` を使用。
- 同一内容の `/oracle/[slug]/` は追加せず、重複URLを避けた。
- title、description、canonical、OGP、パンくず、内部リンク、sitemap、robotsを維持。
- 記事本文と個別カード本文は静的HTMLに出力。
- TOPとオラクルにも12枚全ての結果本文を初期HTMLに含め、操作時は表示状態のみ切り替える。検索用の公開本文は可視状態の個別カードページで提供。
- 既存に構造化データはなく、不要なschemaは追加していない。
- SEO原稿、Content Collection、既存の記事用Layoutを継続。

## 性能への配慮

新規ライブラリ、WebGL、動画、リモートフォントなし。CSS transformとrequestAnimationFrameを使用し、慣性が収まればループを停止。スクロール監視はpassive＋1フレーム1回にまとめる。IntersectionObserverでカードの出現と紙の開きを制御。LCP候補の月はCSSのため画像待ちなし。

全ページ合計の配信JSは最終ビルドの計測値を下の検証記録に記載。実機の60fps・Core Web Vitalsは未計測のため保証しない。

## 変更ファイル

- `src/layouts/Layout.astro` — immersive指定を追加。共通SEOを維持。
- `src/pages/index.astro` — 共通の月・カード体験を組み込み、下部の既存記事導線を維持。
- `src/pages/oracle/index.astro` — 共通カード体験へ移行。
- `src/pages/oracle/cards/[slug].astro` — 静的アート、段落、関連カード。
- `src/data/cards.ts` — artwork指定と余白の本文。
- `README.md` — V2の手順・参照先。

## 新規ファイル

- `src/components/MoonJourney.astro`
- `src/components/OracleExperience.astro`
- `src/components/OracleCardBack.astro`
- `src/components/CardArt.astro`
- `src/components/NotebookTransition.astro`
- `src/scripts/oracle.ts`
- `src/styles/immersive.css`
- `V2-PROTOTYPE.md`

## 今後改善したい点

- iPhone / Androidの実機で指の速度、慣性、選択閾値を調整する。
- Safariでの3D反転、VoiceOver、OSのreduced-motion設定を実機確認する。
- 正式なカードアート、残りのカード原稿、長文原稿を整備する。
- 月情報は出典付きデータを別工程で実装する。現状は確認中。
- 手帳の永続保存・ダウンロード等は未実装。今回は遷移と書き心地の試作に限定。
- 公開前に実ドメインをSITE_URLへ設定する。現状はexample.com、公開デプロイ未実施。

## Build size (all emitted files)

- JavaScript: 9099 bytes raw / 4393 bytes gzip
- CSS: 7532 bytes gzip

## 最終検証（2026-09-16）

- `npm run check`: 0 errors / 0 warnings / 0 hints。
- `npm run build`: 成功、既存21ページを静的生成。
- 出力HTMLで全ページのH1・metadata・canonical・内部リンク、sitemap・robotsを確認。
- TOPと/oracle/に12枚の結果原稿が初期HTMLとして含まれることを確認。
- 390pxを中心に430px、768px、1440pxを確認。追加で320pxのTOPと結果、タップ操作を確認。いずれもページ全体の横はみ出しなし。
- 390pxで左右ドラッグ後の中央カード変更、上方向ドラッグで選択、反転後の結果表示を実操作確認。
- 430pxで矢印キー移動、Enter選択、長文「余白」の段落表示を確認。
- 768px・1440pxでカードの重なりと結果の2列レイアウトを確認。
- 手帳への問いの引き継ぎ、文字入力、カードへ戻る操作・フォーカスを確認。
- 月のスクロール連動・縮小、紙の開き、6種類のアートを確認。
- ブラウザconsole error: 0件。
- package.jsonとpackage-lock.jsonは変更なし。
- reduced-motionのCSS・JS分岐は実装・コード確認済み。OS設定での動作、ネイティブなiOS/Androidのタッチ操作、実機fps、Lighthouseは未検証。
- 配信サイズはdist配下の全JS/CSSファイルを個別gzipして合算した値。特定ルートでの通信量、実際のホスティングの圧縮率とは異なる。
