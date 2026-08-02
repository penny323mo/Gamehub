# Elden Ring II — Veil of the Hollow Crown

Game Hub 內置版的 fan-made 3D dark-fantasy browser game。內容包括三個職業、兩輪骷髏戰、雙階段 Boss、lock-on、stamina、dodge、手機虛擬搖桿與右半畫面拖曳鏡頭。

## Local development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run typecheck
npm test
```

`vite.config.ts` 使用相對 base，production 入口為 `dist/index.html`，可安全部署於 Game Hub 的 nested GitHub Pages path。完成紀錄預設保存在 browser localStorage；如提供 browser-safe `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`，亦可沿用原專案的登入 session 作可選 cloud write。

## Assets and license

角色與 final monster 來自 Quaternius，城堡環境來自 Kenney，地牢場景及骷髏來自 KayKit，地面材質來自 Poly Haven；隨附視覺資產均為 CC0。音樂與音效亦使用 CC0 素材。原始來源及 license 記錄保存在 `public/assets/licenses/`，遊戲內 credits 仍可開啟。

本作為非商業 fan-made concept，與 FromSoftware 或 Bandai Namco Entertainment 無關。
