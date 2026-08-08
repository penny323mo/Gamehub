// 攞 CC0 3D 資產入 repo，**由一份清單攞**，唔係人手抄。
//
// 點解要有呢個 script：資產本身入咗 git（Pages 要派），但「邊個檔、由邊度嚟、
// 咩牌照」呢三樣如果淨係靠 commit message 記，下次要加／換嘅時候就冇得核對。
// 清單喺呢度，License.txt 一齊攞埋，重跑一次就核對得返。
//
// 來源：Kenney（kenney.nl）嘅官方資產，CC0 1.0，經 GitHub 鏡像
// ETdoFresh/kenney.nl 攞——呢個環境嘅 egress 擋咗 kenney.nl 同 itch.io，
// 但 raw.githubusercontent.com 通。牌照原文一樣攞埋落 licenses/。
//
// 跑法：node games/tower/scripts/fetch-assets.mjs [--force]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'public', 'models');
const BASE = 'https://raw.githubusercontent.com/ETdoFresh/kenney.nl/master';
const FORCE = process.argv.includes('--force');

const TD = 'tower-defense-kit-1/Models/GLTF format';
const GY = 'kenney_graveyardkit_3/Models/GLTF format';
const FT = 'fantasy-town-kit-1.0/Models/GLTF format';

// 塔係模組化嘅：base → bottom → middle → top → roof 疊上去，啱晒三級升級制。
const 塔件 = [
  'towerRound_base', 'towerRound_bottomA', 'towerRound_bottomB', 'towerRound_bottomC',
  'towerRound_middleA', 'towerRound_middleB', 'towerRound_middleC',
  'towerRound_topA', 'towerRound_topB', 'towerRound_topC',
  'towerRound_roofA', 'towerRound_roofB', 'towerRound_roofC', 'towerRound_crystals',
  'towerSquare_bottomA', 'towerSquare_bottomB', 'towerSquare_bottomC',
  'towerSquare_middleA', 'towerSquare_middleB', 'towerSquare_middleC',
  'towerSquare_topA', 'towerSquare_topB', 'towerSquare_topC',
  'towerSquare_roofA', 'towerSquare_roofB', 'towerSquare_roofC',
];
// 武器頭：kit 只有四個，而遊戲有七種塔——差嗰三種要靠件同色砌（見 ADR）。
const 武器 = ['weapon_ballista', 'weapon_blaster', 'weapon_cannon', 'weapon_catapult'];
// 路磚：kit 嘅格就係一單位，同 map.json 嘅 cellSize 1 對得上。
const 路磚 = [
  'tile', 'tile_straight', 'tile_cornerRound', 'tile_cornerSquare', 'tile_cornerInner',
  'tile_cornerOuter', 'tile_crossing', 'tile_split', 'tile_end', 'tile_endRound',
  'tile_spawn', 'tile_endSpawn', 'tile_dirt', 'tile_rock', 'tile_tree', 'tile_treeDouble',
  'tile_crystal', 'tile_hill', 'tile_riverStraight', 'tile_riverCorner', 'tile_riverBridge',
];
const 裝飾 = [
  'detail_crystal', 'detail_crystalLarge', 'detail_rocks', 'detail_rocksLarge',
  'detail_tree', 'detail_treeLarge', 'detail_dirt', 'detail_dirtLarge',
  'woodStructure', 'woodStructure_high',
];
// 敵人：墓園 kit 嘅五隻生物。冇骨冇動畫，郁動照舊喺 code 度做（本來就係）。
const 敵人 = ['skeleton', 'zombie', 'ghost', 'vampire', 'digger'];
// 出生門同終點城堡：TD kit 冇門冇城堡，由 fantasy town kit 攞。兩套都係
// 一單位格（量過：牆 1.0 × 1.0、柱 1.0 高），所以撈埋一齊唔使縮放。
const 建築 = [
  'wallDoorwaySquareWide', 'wallDoor', 'wallArch', 'pillarStone',
  'wall', 'wallWindowRound', 'wallCorner', 'stairsStone',
  'bannerRed', 'bannerGreen', 'roofHighPoint', 'lantern',
];

const 清單 = [
  ...塔件.map((n) => [`${TD}/${n}.glb`, `towers/${n}.glb`]),
  ...武器.map((n) => [`${TD}/${n}.glb`, `towers/${n}.glb`]),
  ...路磚.map((n) => [`${TD}/${n}.glb`, `tiles/${n}.glb`]),
  ...裝飾.map((n) => [`${TD}/${n}.glb`, `scenery/${n}.glb`]),
  ...敵人.map((n) => [`${GY}/${n}.glb`, `enemies/${n}.glb`]),
  ...建築.map((n) => [`${FT}/${n}.glb`, `structures/${n}.glb`]),
  ['tower-defense-kit-1/License.txt', 'licenses/kenney-tower-defense-kit.txt'],
  ['kenney_graveyardkit_3/License.txt', 'licenses/kenney-graveyard-kit.txt'],
  ['fantasy-town-kit-1.0/License.txt', 'licenses/kenney-fantasy-town-kit.txt'],
];

// 一個 GLB 至少要似個 GLB：唔係就寧願唔好寫落去，等下次重跑再攞。
const 驗 = (buf, rel) => {
  if (!rel.endsWith('.glb')) return buf.length > 0;
  return buf.length > 20 && buf.subarray(0, 4).toString('latin1') === 'glTF';
};

let 攞咗 = 0, 跳過 = 0; const 壞 = [];
for (const [src, dst] of 清單) {
  const 落點 = path.join(OUT, dst);
  if (!FORCE && fs.existsSync(落點)) { 跳過 += 1; continue; }
  const url = `${BASE}/${src.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url);
  if (!res.ok) { 壞.push(`${res.status} ${src}`); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!驗(buf, dst)) { 壞.push(`唔似 GLB: ${src}`); continue; }
  fs.mkdirSync(path.dirname(落點), { recursive: true });
  fs.writeFileSync(落點, buf);
  攞咗 += 1;
}

const 總大細 = 清單.reduce((s, [, d]) => {
  const p = path.join(OUT, d);
  return s + (fs.existsSync(p) ? fs.statSync(p).size : 0);
}, 0);
console.log(`攞咗 ${攞咗} 個、跳過 ${跳過} 個（已經有）、清單共 ${清單.length} 個，合共 ${(總大細 / 1024).toFixed(0)} KB`);
if (壞.length) { console.log('攞唔到:'); for (const b of 壞) console.log('  ' + b); process.exit(1); }
