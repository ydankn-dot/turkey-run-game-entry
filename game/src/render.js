// Every pixel of Gobble Dash: the autumn farm, the turkey, the farmer, the
// hazards, the HUD and the title and end screens. All art is drawn with the
// canvas API, so the game ships no image files. The scene is drawn from the
// game state alone, which is what makes the screenshot scenes exact.
import {
  KIND_CORN,
  KIND_FEATHER,
  KIND_FENCE,
  KIND_HAY,
  KIND_KNIFE,
  KIND_OVEN,
  KIND_PIE,
  KIND_PUMPKIN,
  KIND_TRAP,
  METRES_TO_ESCAPE,
  STAGES,
} from './levels.js';
import { GROUND_Y } from './entities.js';

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;

const BROWN = '#8d5a2b';
const BROWN_DARK = '#6b421e';
const BODY = '#a9713a';
const WING = '#7d4f27';
const RED = '#c0392b';
const ORANGE = '#e67e22';

/** Fill a vertical gradient over a rectangle. */
function gradient(ctx, x, y, width, height, top, bottom) {
  const g = ctx.createLinearGradient(x, y, x, y + height);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, width, height);
}

function circle(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloud(ctx, x, y, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff8ec';
  ellipse(ctx, x, y, 42 * scale, 20 * scale);
  ellipse(ctx, x + 30 * scale, y + 4 * scale, 32 * scale, 16 * scale);
  ellipse(ctx, x - 32 * scale, y + 6 * scale, 28 * scale, 14 * scale);
  ctx.restore();
}

function drawSky(ctx, game) {
  const stage = game.stage;
  gradient(ctx, 0, 0, VIEW_WIDTH, GROUND_Y, stage.skyTop, stage.skyBottom);
  // Low autumn sun.
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 1080, 110, 52);
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, 1080, 110, 66);
  drawCloud(ctx, 200 + (game.scroll * 0.02) % 1400 - 100, 90, 1, 0.9);
  drawCloud(ctx, 700 - (game.scroll * 0.03) % 1400, 150, 0.8, 0.8);
  drawCloud(ctx, 1050 + (game.scroll * 0.015) % 1400 - 200, 60, 1.2, 0.7);
}

function drawDistantFarm(ctx, game) {
  const offset = (game.scroll * 0.15) % 320;
  ctx.fillStyle = '#9c6644';
  // Rolling hills.
  ctx.beginPath();
  ctx.moveTo(0, 520);
  for (let x = 0; x <= VIEW_WIDTH; x += 160) {
    ctx.quadraticCurveTo(x + 80, 470 + ((x / 160) % 2) * 18, x + 160, 520);
  }
  ctx.lineTo(VIEW_WIDTH, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  // Red barn and windmill silhouettes, drifting with the parallax.
  ctx.fillStyle = '#a33b2e';
  for (let i = -1; i < 5; i += 1) {
    const bx = i * 320 - offset + 60;
    ctx.fillRect(bx, 430, 90, 90);
    ctx.beginPath();
    ctx.moveTo(bx - 8, 430);
    ctx.lineTo(bx + 45, 395);
    ctx.lineTo(bx + 98, 430);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = '#7d4f33';
  ctx.lineWidth = 6;
  const wx = 900 - offset;
  ctx.beginPath();
  ctx.moveTo(wx, 520);
  ctx.lineTo(wx, 420);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wx, 420);
  ctx.lineTo(wx + 34, 396);
  ctx.moveTo(wx, 420);
  ctx.lineTo(wx - 30, 400);
  ctx.stroke();
}

function drawKitchenBackdrop(ctx, game) {
  gradient(ctx, 0, 0, VIEW_WIDTH, GROUND_Y, '#f6d8a8', '#e8a56b');
  // Tiled wall.
  ctx.fillStyle = '#f9ead2';
  ctx.fillRect(0, 0, VIEW_WIDTH, 300);
  ctx.strokeStyle = '#e0c9a6';
  ctx.lineWidth = 2;
  for (let y = 0; y < 300; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_WIDTH, y);
    ctx.stroke();
  }
  for (let x = 0; x < VIEW_WIDTH; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 300);
    ctx.stroke();
  }
  // Window with the farm outside, and hanging pots.
  ctx.fillStyle = '#aee2ff';
  ctx.fillRect(90, 60, 200, 160);
  ctx.fillStyle = '#7fb069';
  ctx.fillRect(90, 180, 200, 40);
  ctx.strokeStyle = '#8d5a2b';
  ctx.lineWidth = 8;
  ctx.strokeRect(90, 60, 200, 160);
  ctx.fillStyle = '#5b4636';
  for (let i = 0; i < 4; i += 1) {
    const px = 480 + i * 150 - ((game.scroll * 0.05) % 60);
    ctx.beginPath();
    ctx.arc(px, 90, 26, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(px - 26, 88, 52, 8);
  }
  // Wooden counter along the back.
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(0, 330, VIEW_WIDTH, 26);
  ctx.fillStyle = '#6b421e';
  ctx.fillRect(0, 356, VIEW_WIDTH, 8);
}

function drawGround(ctx, game) {
  const stage = game.stage;
  gradient(ctx, 0, GROUND_Y, VIEW_WIDTH, VIEW_HEIGHT - GROUND_Y, stage.ground, stage.groundDark);
  ctx.fillStyle = stage.groundDark;
  ctx.fillRect(0, GROUND_Y, VIEW_WIDTH, 6);
  if (game.stage.id === 'kitchen') {
    // Checkerboard tile floor.
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        if ((row + col) % 2 === 0) continue;
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(col * 80, GROUND_Y + 8 + row * 40, 80, 40);
      }
    }
    return;
  }
  const offset = game.scroll % 90;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = -offset; x < VIEW_WIDTH; x += 90) {
    // Grass tufts and straw.
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 46);
    ctx.lineTo(x + 8, GROUND_Y + 26);
    ctx.lineTo(x + 16, GROUND_Y + 46);
    ctx.closePath();
    ctx.fill();
  }
}

/** The turkey, facing right, mid-stride. Drawn at its own x/y. */
export function drawTurkey(ctx, turkey, time) {
  if (turkey.hiding) {
    // Only the tail feathers poke out of the haystack.
    ctx.save();
    ctx.translate(turkey.x + turkey.width / 2, GROUND_Y - 84);
    ctx.fillStyle = BROWN;
    for (let i = -1; i <= 1; i += 1) {
      ellipse(ctx, i * 12, -8 - Math.abs(i) * -2, 7, 18, i * 0.3);
    }
    ctx.restore();
    return;
  }
  const bob = turkey.grounded ? Math.sin(turkey.runPhase * 2) * 2 : 0;
  const cx = turkey.x + turkey.width / 2;
  const cy = turkey.y + turkey.height / 2 + bob;
  ctx.save();
  ctx.translate(cx, cy);
  if (turkey.sliding) ctx.scale(1.25, 0.55);
  // Tail fan.
  ctx.fillStyle = BROWN;
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32 - 0.5);
    ellipse(ctx, -34, -18, 9, 26);
    ctx.restore();
  }
  ctx.fillStyle = '#e9c46a';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.32 - 0.5);
    ellipse(ctx, -34, -34, 4, 8);
    ctx.restore();
  }
  // Legs.
  const legSwing = turkey.grounded ? Math.sin(turkey.runPhase * 2) * 10 : 6;
  ctx.strokeStyle = ORANGE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 26);
  ctx.lineTo(-6 + legSwing, 40);
  ctx.moveTo(8, 26);
  ctx.lineTo(8 - legSwing, 40);
  ctx.stroke();
  // Body.
  ctx.fillStyle = BODY;
  ellipse(ctx, 0, 4, 30, 26);
  // Wing, flapping while airborne.
  const flap = turkey.grounded ? 0 : Math.sin(time * 22) * 0.5 - 0.4;
  ctx.save();
  ctx.translate(-4, 0);
  ctx.rotate(flap);
  ctx.fillStyle = WING;
  ellipse(ctx, -4, 6, 18, 11, -0.3);
  ctx.restore();
  // Neck and head.
  ctx.fillStyle = BODY;
  ellipse(ctx, 22, -18, 9, 20, 0.25);
  circle(ctx, 30, -36, 13);
  // Beak, wattle, eye.
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(40, -38);
  ctx.lineTo(54, -33);
  ctx.lineTo(40, -29);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = RED;
  ellipse(ctx, 34, -24, 4, 8);
  ctx.fillStyle = '#222';
  circle(ctx, 33, -39, 2.5);
  ctx.restore();
  // Hit flash.
  if (turkey.invulnTime > 0 && Math.floor(time * 12) % 2 === 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ellipse(ctx, cx, cy, 34, 34);
    ctx.restore();
  }
}

/** The farmer, chasing from the left, pitchfork in hand. */
export function drawFarmer(ctx, farmer, turkey) {
  const x = turkey.x - farmer.gap;
  if (x < -160) return;
  const y = GROUND_Y - 118;
  const legSwing = Math.sin(farmer.runPhase * 2) * 12;
  ctx.save();
  ctx.translate(x + 40, y + 60);
  // Legs.
  ctx.strokeStyle = '#2f4858';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-8, 40);
  ctx.lineTo(-8 + legSwing, 58);
  ctx.moveTo(10, 40);
  ctx.lineTo(10 - legSwing, 58);
  ctx.stroke();
  // Overalls and shirt.
  ctx.fillStyle = '#2f4858';
  ctx.fillRect(-16, 6, 34, 38);
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(-16, -18, 34, 26);
  // Arms: one pumping, one holding the pitchfork.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-12, -10);
  ctx.lineTo(-26, 6 + legSwing * 0.5);
  ctx.stroke();
  // Pitchfork.
  ctx.strokeStyle = '#8d99ae';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(16, -30);
  ctx.lineTo(34, -72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, -78);
  ctx.lineTo(40, -72);
  ctx.moveTo(34, -80);
  ctx.lineTo(40, -72);
  ctx.moveTo(40, -78);
  ctx.lineTo(40, -72);
  ctx.stroke();
  // Head, straw hat, moustache.
  ctx.fillStyle = '#f1c27d';
  circle(ctx, 2, -32, 14);
  ctx.fillStyle = '#e9c46a';
  ellipse(ctx, 2, -42, 22, 7);
  ctx.fillRect(-12, -56, 28, 14);
  ctx.fillStyle = '#5b4636';
  ellipse(ctx, 2, -22, 10, 3);
  ctx.fillStyle = '#222';
  circle(ctx, 7, -35, 2);
  ctx.restore();
  if (farmer.searching) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('?', x + 30, y - 18);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('?', x + 52, y - 40);
  }
  if (farmer.shoutTime > 0 && !farmer.searching) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('COME BACK HERE!', x - 20, y - 20);
  }
}

function drawFence(ctx, o) {
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(o.x, o.y, 8, o.height);
  ctx.fillRect(o.x + o.width - 8, o.y, 8, o.height);
  ctx.fillRect(o.x, o.y + 10, o.width, 10);
  ctx.fillRect(o.x, o.y + 38, o.width, 10);
  ctx.fillStyle = '#a9713a';
  ctx.fillRect(o.x, o.y, o.width, 6);
}

function drawKnife(ctx, o) {
  ctx.save();
  ctx.translate(o.x + o.width / 2, o.y + o.height / 2);
  ctx.rotate(o.spin);
  ctx.fillStyle = '#dfe3ee';
  ctx.beginPath();
  ctx.moveTo(-28, -4);
  ctx.lineTo(8, -7);
  ctx.lineTo(28, 0);
  ctx.lineTo(8, 7);
  ctx.lineTo(-28, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b4636';
  ctx.fillRect(-28, -4, 12, 8);
  ctx.restore();
}

function drawPumpkin(ctx, o) {
  ctx.save();
  ctx.translate(o.x + o.width / 2, o.y + o.height / 2);
  ctx.rotate(o.spin);
  ctx.fillStyle = ORANGE;
  ellipse(ctx, 0, 0, 26, 22);
  ctx.strokeStyle = '#c85a00';
  ctx.lineWidth = 3;
  for (const dx of [-12, 0, 12]) {
    ctx.beginPath();
    ctx.ellipse(dx, 0, 6, 21, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#2f9e44';
  ctx.fillRect(-3, -26, 6, 10);
  // Grinning face.
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.moveTo(-14, -4);
  ctx.lineTo(-8, 2);
  ctx.lineTo(-2, -4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.lineTo(10, 2);
  ctx.lineTo(16, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawOven(ctx, o) {
  ctx.fillStyle = '#3d405b';
  ctx.fillRect(o.x, o.y, o.width, o.height);
  ctx.fillStyle = '#e07a5f';
  ctx.fillRect(o.x + 10, o.y + 12, o.width - 20, 34);
  // Flames licking out of the door.
  ctx.fillStyle = '#f4a259';
  for (let i = 0; i < 4; i += 1) {
    const fx = o.x + 24 + i * 32;
    ctx.beginPath();
    ctx.moveTo(fx, o.y + 46);
    ctx.quadraticCurveTo(fx + 8, o.y + 18, fx + 16, o.y + 46);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('HOT!', o.x + o.width / 2 - 18, o.y + 72);
  ctx.fillStyle = '#dfe3ee';
  ctx.fillRect(o.x + 10, o.y + o.height - 12, o.width - 20, 6);
}

function drawTrap(ctx, o) {
  ctx.fillStyle = '#8d99ae';
  ctx.fillRect(o.x, o.y + o.height - 8, o.width, 8);
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.moveTo(o.x + 8, o.y + o.height - 8);
  ctx.lineTo(o.x + o.width / 2, o.y);
  ctx.lineTo(o.x + o.width - 8, o.y + o.height - 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f1c40f';
  circle(ctx, o.x + o.width / 2, o.y + 4, 5);
}

function drawHay(ctx, o) {
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.ellipse(o.x + o.width / 2, o.y + o.height, o.width / 2 + 6, o.height, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b07f2a';
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(o.x + o.width / 2 + i * 16, o.y + 14);
    ctx.quadraticCurveTo(o.x + o.width / 2 + i * 20, o.y + 44, o.x + o.width / 2 + i * 14, o.y + 80);
    ctx.stroke();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('HIDE (H)', o.x + 8, o.y - 8);
}

function drawObstacle(ctx, o) {
  if (!o.active) return;
  if (o.kind === KIND_FENCE) drawFence(ctx, o);
  else if (o.kind === KIND_KNIFE) drawKnife(ctx, o);
  else if (o.kind === KIND_PUMPKIN) drawPumpkin(ctx, o);
  else if (o.kind === KIND_OVEN) drawOven(ctx, o);
  else if (o.kind === KIND_TRAP) drawTrap(ctx, o);
  else if (o.kind === KIND_HAY) drawHay(ctx, o);
}

function drawPickup(ctx, p, time) {
  if (!p.active) return;
  const y = p.y + p.bob;
  ctx.save();
  ctx.translate(p.x + p.width / 2, y + p.height / 2);
  if (p.kind === KIND_CORN) {
    ctx.fillStyle = '#f4d35e';
    ellipse(ctx, 0, 0, 12, 16);
    ctx.fillStyle = '#2f9e44';
    ctx.beginPath();
    ctx.moveTo(-8, 12);
    ctx.lineTo(-16, 24);
    ctx.lineTo(-2, 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * 6, -12);
      ctx.lineTo(i * 6, 12);
      ctx.stroke();
    }
  } else if (p.kind === KIND_FEATHER) {
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 16, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e9c46a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-4, 14);
    ctx.stroke();
  } else if (p.kind === KIND_PIE) {
    ctx.fillStyle = '#d97b29';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f6d8a8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A heart, filled or empty. */
function drawHeart(ctx, x, y, filled) {
  ctx.fillStyle = filled ? '#e63946' : 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 12, y - 4, x - 6, y - 14, x, y - 6);
  ctx.bezierCurveTo(x + 6, y - 14, x + 12, y - 4, x, y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawHud(ctx, game) {
  // Top bar.
  ctx.fillStyle = 'rgba(43, 30, 18, 0.55)';
  ctx.fillRect(0, 0, VIEW_WIDTH, 64);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${game.score}`, 20, 42);
  for (let i = 0; i < 3; i += 1) {
    drawHeart(ctx, 240 + i * 34, 32, i < game.hearts);
  }
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${Math.floor(game.distance)} m`, 380, 40);
  ctx.fillText(game.stage.name.toUpperCase(), 520, 40);
  // Escape progress: a bar to the forest gate.
  const progress = Math.min(1, game.distance / METRES_TO_ESCAPE);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(760, 24, 300, 16);
  ctx.fillStyle = '#7fb069';
  ctx.fillRect(760, 24, 300 * progress, 16);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('🌲 FOREST', 1070, 40);
  // Farmer proximity: the closer he is, the redder the warning.
  const danger = 1 - Math.min(1, game.farmer.gap / 320);
  if (danger > 0.55 && game.screen === 'play') {
    ctx.fillStyle = danger > 0.8 ? '#e63946' : '#f4a259';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    if (Math.floor(game.time * 4) % 2 === 0 || danger <= 0.8) {
      ctx.fillText('⚠ SPOTTED! RUN! ⚠', VIEW_WIDTH / 2, 110);
    }
    ctx.textAlign = 'left';
  }
  // Mute button.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(VIEW_WIDTH - 56, 12, 40, 40);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(game.muted ? '✕' : '♪', VIEW_WIDTH - 45, 42);
  game.buttons.mute = { x: VIEW_WIDTH - 56, y: 12, width: 40, height: 40 };
}

function panel(ctx, x, y, width, height) {
  ctx.fillStyle = 'rgba(43, 30, 18, 0.82)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, width, height);
}

function button(ctx, id, x, y, width, height, label, game) {
  ctx.fillStyle = '#e67e22';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height / 2 + 9);
  ctx.textAlign = 'left';
  game.buttons[id] = { x, y, width, height };
}

function drawTitle(ctx, game) {
  drawSky(ctx, game);
  drawDistantFarm(ctx, game);
  drawGround(ctx, game);
  drawTurkey(ctx, { ...game.turkey, x: 150, y: GROUND_Y - 78, runPhase: 1.2 }, game.time);
  panel(ctx, 290, 90, 700, 470);
  ctx.fillStyle = '#f4d35e';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', 640, 180);
  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText("A Turkey's Great Escape", 640, 222);
  ctx.font = '22px sans-serif';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster.', 640, 268);
  ctx.fillText('Run 1000 m to the forest — dodge the oven and the carving knife!', 640, 300);
  ctx.fillStyle = '#e9c46a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('SPACE / ↑  jump      ↓  slide      H  hide in hay      M  mute', 640, 348);
  ctx.fillText('Grab corn, pie and golden feathers. 3 hearts. Do not get caught.', 640, 380);
  ctx.fillStyle = '#fff8ec';
  ctx.font = '18px sans-serif';
  ctx.fillText('Farmyard  →  Barn  →  Kitchen  →  Freedom', 640, 424);
  if (game.best > 0) {
    ctx.fillStyle = '#f4d35e';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Best score: ${game.best}`, 640, 458);
  }
  button(ctx, 'start', 490, 478, 300, 56, '▶  START THE ESCAPE', game);
  ctx.textAlign = 'left';
}

function drawEnd(ctx, game) {
  const escaped = game.screen === 'escaped';
  if (escaped) {
    // The forest: the escape ends outdoors, under the autumn sky, on grass.
    drawSky(ctx, game);
    drawDistantFarm(ctx, game);
    const savedStage = game.stage;
    game.stage = STAGES[0];
    drawGround(ctx, game);
    game.stage = savedStage;
    drawTurkey(ctx, { ...game.turkey, x: 1060, y: GROUND_Y - 78, runPhase: 1.2 }, game.time);
    ctx.fillStyle = '#2f9e44';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌲 🌲 🌲  THE FOREST GATE  🌲 🌲 🌲', 640, 120);
    ctx.textAlign = 'left';
  } else {
    drawSky(ctx, game);
    if (game.stage.id === 'kitchen') drawKitchenBackdrop(ctx, game);
    else drawDistantFarm(ctx, game);
    drawGround(ctx, game);
    drawFarmer(ctx, { ...game.farmer, gap: 120, searching: false, shoutTime: 0 }, game.turkey);
  }
  panel(ctx, 340, 150, 600, 380);
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#7fb069' : '#e63946';
  ctx.font = 'bold 58px sans-serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 640, 232);
  ctx.fillStyle = '#fff8ec';
  ctx.font = '26px sans-serif';
  ctx.fillText(
    escaped
      ? 'You outran the farmer and made it to the forest.'
      : 'The farmer got you. Thanksgiving dinner it is…',
    640,
    278,
  );
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Score: ${game.score}      Distance: ${Math.floor(game.distance)} m`, 640, 330);
  ctx.fillText(`Corn ${game.corn}   •   Feathers ${game.feathers}   •   Best ${game.best}`, 640, 366);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#e9c46a';
  ctx.fillText(escaped ? 'The forest is safe. Run again for a bigger score!' : 'Tip: hide in a haystack when the farmer closes in.', 640, 404);
  button(ctx, 'restart', 490, 440, 300, 56, '↻  RUN AGAIN  (R)', game);
  ctx.textAlign = 'left';
}

/** Draw the whole scene for the game's current screen. */
export function drawScene(ctx, game) {
  game.buttons = {};
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
  } else if (game.screen === 'caught' || game.screen === 'escaped') {
    drawEnd(ctx, game);
  } else {
    if (game.stage.id === 'kitchen') drawKitchenBackdrop(ctx, game);
    else {
      drawSky(ctx, game);
      drawDistantFarm(ctx, game);
    }
    drawGround(ctx, game);
    for (const obstacle of game.obstacles) drawObstacle(ctx, obstacle);
    for (const pickup of game.pickups) drawPickup(ctx, pickup, game.time);
    drawFarmer(ctx, game.farmer, game.turkey);
    drawTurkey(ctx, game.turkey, game.time);
    drawHud(ctx, game);
    // Stage hint banner at the start of each stage.
    if (game.hintTime > 0) {
      ctx.fillStyle = 'rgba(43, 30, 18, 0.7)';
      ctx.fillRect(260, 90, 760, 56);
      ctx.fillStyle = '#fff8ec';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${game.stage.name} — ${game.stage.hint}`, 640, 126);
      ctx.textAlign = 'left';
    }
  }
  // The mute button is always clickable.
  if (game.screen === 'title' || game.screen === 'caught' || game.screen === 'escaped') {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(VIEW_WIDTH - 56, 12, 40, 40);
    ctx.fillStyle = '#fff8ec';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(game.muted ? '✕' : '♪', VIEW_WIDTH - 45, 42);
    game.buttons.mute = { x: VIEW_WIDTH - 56, y: 12, width: 40, height: 40 };
  }
}
