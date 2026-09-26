# 指定修正の検証結果（2026-09-16）

- `npm run check`: 0 errors / 0 warnings / 0 hints（ASTRO_TELEMETRY_DISABLED=1）
- `npm run build`: 成功、21ページ生成
- 実ブラウザの360px / 1440pxでTOP・テーマ選択・カード選択・結果画面を確認
- 360px: カード幅132px、列内のみ横スクロール（列幅320px / 内容732px）、ページ全体に横スクロールなし。5枚目をEnterで選択可能
- 1440px: 従来通り5枚並び。Spaceで選択・結果表示を確認
- 結果: 月のfallback、keyword、日本語名を表示。章名・「もう一枚引く」の表示なし
- 「別のテーマで引く」: 結果を閉じてテーマ選択に戻り、選択中のテーマへフォーカス（仕事についてで検証）
- 結果カード: 360pxでframe/clientHeightとscrollHeightは349px、1440pxで408px。文字のはみ出しなし
- 画像領域: 固定1:1、object-fit:contain。画像の有無にかかわらずkeyword・カード名を維持するコード構造を確認。画像未作成のため実画像読み込み成功時の目視検証は未実施
- 12枚のchapterを正式分類と照合済み（データは保持）
- ブラウザconsole error: 0件
- package.json / package-lock.jsonの変更なし、ライブラリ追加なし
- 月情報は未実装のまま。調査はMOON-RESEARCH.mdに分離

## 今回変更したファイル

- src/pages/index.astro
- src/components/MoonStatus.astro
- src/pages/oracle/index.astro
- src/pages/oracle/cards/index.astro（内部分類の章名を一覧からも非表示）
- src/data/cards.ts
- src/styles/global.css
- README.md
- MOON-RESEARCH.md（新規）
- QA.md

以下は前回MVP時点の記録です。戻る導線と結果カードの仕様・寸法については上記を優先してください。

---

# MVP検証結果

- Astro 7.3.2、Node 24.20.0
- `astro check`: 0 errors / 0 warnings / 0 hints
- 最終 `astro build`: 成功、21ページ生成
- 全21ページの内部リンク、固有title、H1が1つ、description、canonical、OGPを出力HTMLで検証
- sitemap.xml: 全21ページ掲載、XMLパース成功
- robots.txt: sitemapへの参照あり
- 実ブラウザ: 360pxと1440pxでカード画面の横スクロールなし、TOPでも横幅を確認
- テーマ選択、Enter / Spaceキーによるカード決定、結果表示、引き直しを実操作で確認
- 結果表示時は結果領域へ、引き直し時は先頭カードへフォーカス移動
- 最終静的ビルドで360pxカード内の文字収まりを確認（clientHeight / scrollHeight とも291px）
- 実ブラウザのconsole error: 0件
- prefers-reduced-motion: CSSの遷移停止・JS待機0msをコードで確認（OS設定変更による実機検証は未実施）
- GA4: ID未設定。実GA4への送信は未検証。イベント呼び出し箇所をコード確認
- 依存: Astro、開発用@astrojs/check、TypeScriptのみ。インストール時npm auditは脆弱性0件
- 検証用Playwrightはwork/側に隔離。OSのブラウザ起動制限で起動できず、Codexブラウザの実操作へ切り替えた
- Lighthouse / Core Web Vitalsの実測、Safari・Firefox、スクリーンリーダー実機検証は未実施

## 公開前に残る作業

月情報の正確なデータ登録、実ドメイン設定、カード画像と追加原稿。現状のcanonical / sitemapにはダミーexample.comを使用。公開デプロイは未実施。
