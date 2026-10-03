// 程序化骨骼動作 — Meshy 自動綁定嘅人形模型有骨骼但零動畫 clip，
// 所以要自己驅動骨頭。骨名係無語義嘅 Bone_NNN，唔可以靠名認，
// 改為靠「靜止姿態嘅幾何結構」推斷邊條係腿、邊條係手臂。
//
// 之前個版本只係將整個模型上下浮／傾側／縮放，所以行路冇腳步、
// 攻擊冇揮手，睇落好生硬。而家真係擺動骨頭。
import * as THREE from 'three';

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// assetKey -> 骨骼分類（只存骨名，因為每個實例都係 SkeletonUtils.clone 出嚟、骨名一致）
const rigPlans = new Map();

// 收集每條骨喺 model 本地空間嘅靜止位置 + 佢個 subtree 嘅範圍
function collectBones(root) {
    root.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
    const bones = [];
    const byName = new Map();
    root.traverse((o) => {
        if (!o.isBone) return;
        const p = new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(inv);
        const rec = { bone: o, name: o.name, pos: p, children: [] };
        bones.push(rec);
        byName.set(o, rec);
    });
    for (const rec of bones) {
        const pr = byName.get(rec.bone.parent);
        rec.parentRec = pr ?? null;
        if (pr) pr.children.push(rec);
    }
    // subtree 統計（最低點、最大橫向伸展、骨數）
    const stat = (rec) => {
        if (rec._stat) return rec._stat;
        let minY = rec.pos.y, maxAbsX = Math.abs(rec.pos.x), count = 1;
        for (const c of rec.children) {
            const s = stat(c);
            minY = Math.min(minY, s.minY);
            maxAbsX = Math.max(maxAbsX, s.maxAbsX);
            count += s.count;
        }
        rec._stat = { minY, maxAbsX, count };
        return rec._stat;
    };
    for (const rec of bones) stat(rec);
    return bones;
}

// 靠骨骼結構推斷（唔靠骨名，Meshy 自動綁定係無語義嘅 Bone_NNN）：
//   髖樞紐 = 有 ≥2 條「落到地面」子鏈嘅骨；嗰幾條子鏈就係腿（雙足 2 條、四足 4 條）
//   軀幹 = 由髖沿住「唔落地」嗰條脊椎鏈向上行
//   肩／手臂 = 脊椎鏈上第一個有 ≥2 條「橫向伸展」子鏈嘅骨
// 左右唔可以靠 x 正負分（有啲 rig 兩條腿 x 都同號），要靠相對大細
function buildPlan(root) {
    const bones = collectBones(root);
    if (!bones.length) return null;
    const H = Math.max(...bones.map(b => b.pos.y));
    if (!(H > 0.2)) return null;

    const lateral = (b) => b._stat.maxAbsX > H * 0.09;
    // 「腿」＝纖細嘅鏈（唔會係整個馬身／上半身），而且伸到低位
    const LIMB_MAX = 8;
    const isLegChain = (b) => b._stat.count >= 2 && b._stat.count <= LIMB_MAX
        && b._stat.minY < H * 0.18 && b.pos.y > H * 0.15 && b.pos.y < H * 0.78;

    // ---- 腿：所有符合條件嘅鏈頂（雙足 2 條、四足最多 4 條）----
    const legCands = bones.filter(isLegChain);
    let legs = legCands.filter(b => !legCands.includes(b.parentRec))
        .sort((a, b) => b._stat.count - a._stat.count).slice(0, 4);
    if (legs.length < 2) legs = null;
    // ---- 肩樞紐：有 ≥2 條「橫向伸展」子鏈嘅骨，取最高嗰個（肩膊喺高位）----
    // 一條規則同時涵蓋人形同騎兵（騎手唔喺馬脊椎鏈下面都搵得到）
    let arms = null, chest = null;
    for (const b of bones) {
        if (b.pos.y < H * 0.5) continue;
        const lat = b.children.filter(lateral);
        if (lat.length < 2) continue;
        if (!chest || b.pos.y > chest.pos.y) {
            chest = b;
            arms = lat.sort((x, y) => y._stat.maxAbsX - x._stat.maxAbsX).slice(0, 2);
        }
    }

    if (!legs && !arms) return null;
    // 左右靠相對 x（唔靠正負）；雙足淨係留最左同最右兩條（劍士披風 Bone_038 喺中線，曾經被當咗第三隻腳）
    if (legs) legs.sort((a, b) => a.pos.x - b.pos.x);
    if (legs && legs.length > 2 && legs.length < 4) legs = [legs[0], legs[legs.length - 1]];
    const legMid = new THREE.Vector3();
    if (legs) { for (const b of legs) legMid.add(b.pos); legMid.divideScalar(legs.length); }
    // 武器手 = subtree 伸得最低嗰隻（拎住兵器嘅手會垂低）。民兵／劍士個盾垂得仲低，
    // 呢兩個模型由 makeRigAnimator 嘅 swapArms 對調（幾何上分唔到盾同兵器）
    let weaponArm = null, offArm = null;
    if (arms) {
        arms.sort((a, b) => a._stat.minY - b._stat.minY);
        weaponArm = arms[0]; offArm = arms[1];
    }

    return {
        // 相位：雙足淨係睇左右（劍士企弓步，兩隻腳 z 一前一後，舊嘅 sign(x)·sign(z) 令兩腳同步擺）；
        // 四足用對角小跑步（左前＋右後一組），以四隻腳嘅中心分前後左右
        legs: legs ? legs.map((b, i) => ({
            name: b.name,
            phase: legs.length < 4 ? (i === 0 ? 1 : -1)
                : (b.pos.x >= legMid.x ? 1 : -1) * (b.pos.z >= legMid.z ? 1 : -1),
        })) : null,
        chest: chest ? chest.name : null,
        weaponArm: weaponArm ? weaponArm.name : null,
        offArm: offArm ? offArm.name : null,
        quadruped: !!(legs && legs.length >= 4),
        height: H,
        hipY: legs ? legs.reduce((m, b) => m + b.pos.y, 0) / legs.length : 0,
    };
}

export function getRigPlan(key, root) {
    if (!rigPlans.has(key)) {
        let plan = null;
        try { plan = buildPlan(root); } catch { plan = null; }
        rigPlans.set(key, plan);
    }
    return rigPlans.get(key);
}

// 將 model 空間嘅旋轉軸，換算落骨頭 parent 空間（噉樣唔使猜個 rig 用咩骨向慣例）
function axisInParentSpace(bone, root, axis) {
    const out = axis.clone();
    const parent = bone.parent;
    if (!parent) return out.normalize();
    root.updateMatrixWorld(true);
    const rootQ = new THREE.Quaternion();
    root.getWorldQuaternion(rootQ);
    const pQ = new THREE.Quaternion();
    parent.getWorldQuaternion(pQ);
    // parent 相對 model root 嘅旋轉，再反轉
    const rel = rootQ.clone().invert().multiply(pQ).invert();
    return out.applyQuaternion(rel).normalize();
}

function makeJoint(bone, root, axis) {
    return {
        bone,
        rest: bone.quaternion.clone(),
        axis: axisInParentSpace(bone, root, axis),
        _q: new THREE.Quaternion(),
    };
}

function setSwing(j, angle) {
    if (!j) return;
    j._q.setFromAxisAngle(j.axis, angle);
    j.bone.quaternion.copy(j._q).multiply(j.rest);
}

// attackStyle: 'swing'（劈）｜'thrust'（突刺）｜'shoot'（射擊）｜'cast'（施法）
// 步態相位由「真係行咗幾遠」推（唔再係 t × 固定頻率），所以快兵慢兵、冰凍減速都唔會滑步。
// legAmp：腳擺幅（騎兵嘅 walkAmp 係騎手隻腳＝0，馬腳另計）；swapArms：武器同盾手對調。
export function makeRigAnimator(key, model, {
    attackStyle = 'swing', walkAmp = 0.55, walkSpeed = 7.5, armAmp = 0.42, legAmp: legAmpOpt, swapArms = false,
} = {}) {
    const plan = getRigPlan(key, model);
    if (!plan) return null;
    const find = (name) => {
        if (!name) return null;
        let hit = null;
        model.traverse(o => { if (!hit && o.isBone && o.name === name) hit = o; });
        return hit;
    };
    // 腿：每條記住相位（對角步；雙足自然變左右交替）
    const jLegs = [];
    for (const l of plan.legs ?? []) {
        const b = find(l.name);
        if (b) jLegs.push({ j: makeJoint(b, model, X_AXIS), phase: l.phase });
    }
    const wArm = find(swapArms ? plan.offArm : plan.weaponArm);
    const oArm = find(swapArms ? plan.weaponArm : plan.offArm);
    const chest = find(plan.chest);
    if (!jLegs.length && !wArm) return null;

    // 手臂前後擺動繞 model 空間 X 軸；軀幹扭腰繞 Y 軸
    const jArmW = wArm && makeJoint(wArm, model, X_AXIS);
    const jArmO = oArm && makeJoint(oArm, model, X_AXIS);
    const jChest = chest && makeJoint(chest, model, Y_AXIS);
    // 四足（例如騎兵嘅馬）步幅細啲、頻率高啲先似奔跑
    const quad = plan.quadruped;
    const legAmp = legAmpOpt ?? walkAmp * (quad ? 0.6 : 1);
    const legSpeed = walkSpeed * (quad ? 1.25 : 1);
    const setLegs = (fn) => { for (const L of jLegs) setSwing(L.j, fn(L.phase)); };

    // 一個步態周期（2π，左右各一步）身體前進 ≈ 4 × 腳長 × sin(擺幅)
    const hipBone = jLegs[0]?.j.bone;
    let cycleLen = 0, phase = 0, lastT = null;
    const lastPos = new THREE.Vector3(), curPos = new THREE.Vector3();
    const gait = (t, moving) => {
        const holder = model.parent ?? model;
        holder.getWorldPosition(curPos);
        if (!cycleLen && hipBone) {
            model.updateMatrixWorld(true);
            const hipY = hipBone.getWorldPosition(new THREE.Vector3()).y - curPos.y;
            cycleLen = 4 * Math.max(0.2, hipY) * Math.sin(Math.max(0.15, legAmp));
        }
        let dt = lastT === null ? 0 : t - lastT;
        if (!(dt > 0 && dt < 0.25)) dt = 0;
        const moved = lastT === null ? 0 : Math.hypot(curPos.x - lastPos.x, curPos.z - lastPos.z);
        lastT = t; lastPos.copy(curPos);
        if (!moving) return phase;
        // 推緊但企住（塞車）就慢慢踏步，唔好成個凍住
        const adv = cycleLen ? moved / cycleLen * Math.PI * 2 : legSpeed * dt;
        phase += Math.min(Math.PI * 0.5, Math.max(adv, legSpeed * 0.25 * dt));
        return phase;
    };
    const animate = (t, state) => {
        const ph = gait(t, state.moving && state.attackT < 0);
        animate.phase = ph;
        if (state.attackT >= 0) {
            const p = state.attackT;
            let armAngle = 0, twist = 0, legSpread = 0;
            if (attackStyle === 'shoot') {
                // 舉槍／拉弓：迅速舉起、輕微後座、慢慢放低
                const raise = p < 0.18 ? p / 0.18 : Math.max(0, 1 - (p - 0.5) / 0.5);
                const recoil = p >= 0.18 && p < 0.3 ? Math.sin((p - 0.18) / 0.12 * Math.PI) : 0;
                armAngle = -1.15 * raise + 0.22 * recoil;
                twist = 0.12 * raise;
            } else if (attackStyle === 'thrust') {
                // 突刺：短距離後抽再快速前推
                const jab = p < 0.25 ? -(p / 0.25) * 0.5 : Math.min(1, (p - 0.25) / 0.2) * 1.0 - 0.5;
                armAngle = -0.35 - jab * 0.8;
                twist = -jab * 0.3;
            } else if (attackStyle === 'cast') {
                // 施法：緩慢舉手，冇殺氣
                const raise = Math.sin(Math.min(1, p) * Math.PI);
                armAngle = -1.3 * raise;
                twist = 0.1 * raise;
            } else {
                // 劈斬：先抬高蓄力，再大力斬落
                if (p < 0.32) { const w = p / 0.32; armAngle = -1.7 * w; twist = -0.35 * w; }
                else { const s = Math.min(1, (p - 0.32) / 0.34); armAngle = -1.7 + 2.5 * s; twist = -0.35 + 0.6 * s; }
                legSpread = 0.18;
            }
            setSwing(jArmW, armAngle);
            setSwing(jArmO, armAngle * (attackStyle === 'shoot' ? 0.75 : -0.3));
            setSwing(jChest, twist);
            // 揮擊嗰刻紮馬（四足就唔紮，繼續碎步）
            setLegs(p2 => (quad ? Math.sin(t * legSpeed + (p2 > 0 ? 0 : Math.PI)) * legAmp * 0.35 : p2 * legSpread));
            return;
        }
        if (state.moving) {
            // 行走／奔跑：腿按相位交替前後擺（四足會自然變對角步），手臂反相擺
            const s = Math.sin(ph);
            setLegs(p2 => (p2 > 0 ? s : -s) * legAmp);
            setSwing(jArmW, -s * armAmp);
            setSwing(jArmO, s * armAmp);
            setSwing(jChest, s * 0.09);
            return;
        }
        // 企定：輕微呼吸擺動，唔好似木頭人
        const b = Math.sin(t * 1.9) * 0.055;
        setLegs(p2 => (p2 > 0 ? b : -b) * 0.35);
        setSwing(jArmW, b);
        setSwing(jArmO, -b);
        setSwing(jChest, Math.sin(t * 1.3) * 0.05);
    };
    animate.phase = 0;
    return animate;
}
