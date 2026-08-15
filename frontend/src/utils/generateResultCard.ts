// ============================================================
// Client-Side Canvas Social Card Generator (1080 x 1350 PNG) — V4
// Includes Achievements, Mind Reader Scores, Category Breakdown
// ============================================================

import type { FinalReport } from '../types/game';

export async function generateResultCardCanvas(
  report: FinalReport,
  hostName: string,
  guestName: string
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Background — Sunshine Yellow
  ctx.fillStyle = '#FFF176';
  ctx.fillRect(0, 0, width, height);

  // Subtle decorative dots pattern
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let x = 30; x < width; x += 45) {
    for (let y = 30; y < height; y += 45) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Outer border
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 16;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // --- BRAND HEADER ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FF3CAC';
  ctx.font = '900 64px "Outfit", system-ui, sans-serif';
  ctx.fillText('THIS ', width / 2 - 130, 120);

  ctx.fillStyle = '#FFD600';
  ctx.font = '900 70px "Outfit", system-ui, sans-serif';
  ctx.fillText('⚡', width / 2 - 10, 120);

  ctx.fillStyle = '#7B2FBE';
  ctx.font = '900 64px "Outfit", system-ui, sans-serif';
  ctx.fillText(' THAT', width / 2 + 130, 120);

  ctx.fillStyle = '#71717A';
  ctx.font = '800 22px "Outfit", system-ui, sans-serif';
  ctx.fillText('SYNC UP • MATCH MINDS', width / 2, 160);

  // --- MAIN CARD (Cream Container) ---
  const cardX = 75;
  const cardY = 190;
  const cardW = width - 150;
  const cardH = 990;
  const cardR = 32;

  // Shadow
  ctx.fillStyle = '#18181B';
  roundRect(ctx, cardX + 12, cardY + 12, cardW, cardH, cardR);
  ctx.fill();

  // Card Body
  ctx.fillStyle = '#FFFDE7';
  roundRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Player Names Matchup
  ctx.fillStyle = '#18181B';
  ctx.font = '900 36px "Outfit", system-ui, sans-serif';
  ctx.fillText(`${hostName.toUpperCase()}  ×  ${(guestName || 'GUEST').toUpperCase()}`, width / 2, cardY + 58);

  // Match Percentage Big Pill
  const pillW = 460;
  const pillH = 80;
  const pillX = width / 2 - pillW / 2;
  const pillY = cardY + 85;

  ctx.fillStyle = '#18181B';
  roundRect(ctx, pillX + 6, pillY + 6, pillW, pillH, 40);
  ctx.fill();

  ctx.fillStyle = '#00E5A0'; // Mint Green
  roundRect(ctx, pillX, pillY, pillW, pillH, 40);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.font = '900 48px "Outfit", system-ui, sans-serif';
  ctx.fillText(`${report.matchPercentage}% MATCH`, width / 2, pillY + 58);

  // Headline
  ctx.fillStyle = '#FF3CAC';
  ctx.font = '900 34px "Outfit", system-ui, sans-serif';
  const headline = `"${report.headline}"`;
  wrapText(ctx, headline, width / 2, cardY + 215, cardW - 80, 42);

  // Score Subtitle
  ctx.fillStyle = '#71717A';
  ctx.font = '800 22px "Outfit", system-ui, sans-serif';
  const matchText = report.isPartial
    ? `${report.completedQuestions} QUESTIONS COMPLETED (PARTIAL RESULT)`
    : `${Math.round((report.matchPercentage / 100) * report.completedQuestions)} / ${report.completedQuestions} QUESTIONS MATCHED`;
  ctx.fillText(matchText, width / 2, cardY + 270);

  // --- ACHIEVEMENTS PILLS ROW ---
  let curY = cardY + 315;
  if (report.achievements && report.achievements.length > 0) {
    const badges = report.achievements.slice(0, 3);
    const badgeW = (cardW - 60 - (badges.length - 1) * 16) / badges.length;
    badges.forEach((ach, i) => {
      const bx = cardX + 30 + i * (badgeW + 16);
      ctx.fillStyle = '#EDE9FE';
      roundRect(ctx, bx, curY, badgeW, 46, 23);
      ctx.fill();
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#7B2FBE';
      ctx.font = '800 18px "Outfit", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${ach.icon} ${ach.title.replace(/[^A-Za-z0-9 ]/g, '').trim()}`, bx + badgeW / 2, curY + 30);
    });
    curY += 60;
  }

  // --- INSTINCT VS STRATEGY PILL ROW ---
  if (report.instinctMatchPercentage !== undefined && report.strategicMatchPercentage !== undefined) {
    const halfW = (cardW - 76) / 2;
    // Box 1: 10s Instinct
    ctx.fillStyle = '#FEF08A';
    roundRect(ctx, cardX + 30, curY, halfW, 42, 12);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#18181B';
    ctx.font = '800 17px "Outfit", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ 10s Instinct: ${report.instinctMatchPercentage}%`, cardX + 30 + halfW / 2, curY + 27);

    // Box 2: 16s Strategy
    ctx.fillStyle = '#E0F2FE';
    roundRect(ctx, cardX + 30 + halfW + 16, curY, halfW, 42, 12);
    ctx.fill();
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#0369A1';
    ctx.fillText(`🧠 16s Strategy: ${report.strategicMatchPercentage}%`, cardX + 30 + halfW + 16 + halfW / 2, curY + 27);

    curY += 56;
  }

  // Divider line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(cardX + 40, curY);
  ctx.lineTo(cardX + cardW - 40, curY);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Section 1: Mind Reader Score
  if (report.predictionScore) {
    curY += 36;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0284C7';
    ctx.font = '900 24px "Outfit", system-ui, sans-serif';
    ctx.fillText('🧠 MIND READER TELEPATHY', cardX + 50, curY);

    curY += 32;
    ctx.fillStyle = '#18181B';
    ctx.font = '700 22px "Outfit", system-ui, sans-serif';
    curY = wrapText(ctx, report.predictionScore.summary, cardX + 50, curY, cardW - 100, 30, false);
  }

  // Section 2: Same Brain Highlights
  curY += 25;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#7B2FBE';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('⚡ SAME BRAIN HIGHLIGHTS', cardX + 50, curY);

  curY += 36;
  ctx.fillStyle = '#18181B';
  ctx.font = '700 22px "Outfit", system-ui, sans-serif';
  const matchHighlights = (report.strongestMatches || []).slice(0, 2);
  for (const m of matchHighlights) {
    ctx.fillText(`• ${m}`, cardX + 50, curY);
    curY += 32;
  }

  // Section 3: Chaos Award (Funniest Difference)
  curY += 15;
  ctx.fillStyle = '#FF3CAC';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('😂 CHAOS AWARD', cardX + 50, curY);

  curY += 36;
  ctx.fillStyle = '#27272A';
  ctx.font = 'italic 700 22px "Outfit", system-ui, sans-serif';
  const chaosText = `"${report.funniestDifference || 'One plans everything, the other improvises!'}"`;
  curY = wrapText(ctx, chaosText, cardX + 50, curY, cardW - 100, 30, false);

  // Section 4: Final Verdict
  curY += 15;
  ctx.fillStyle = '#18181B';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('🔮 THE VERDICT', cardX + 50, curY);

  curY += 34;
  ctx.fillStyle = '#3F3F46';
  ctx.font = '600 21px "Outfit", system-ui, sans-serif';
  wrapText(ctx, report.finalVerdict, cardX + 50, curY, cardW - 100, 28, false);

  // --- FOOTER ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#18181B';
  ctx.font = '800 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('Play THIS ⚡ THAT with your friends • synq', width / 2, height - 60);

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  center = true
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (center) {
        ctx.fillText(line.trim(), x, currentY);
      } else {
        ctx.fillText(line.trim(), x, currentY);
      }
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

export async function downloadResultCard(
  report: FinalReport,
  hostName: string,
  guestName: string
): Promise<void> {
  const canvas = await generateResultCardCanvas(report, hostName, guestName);
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `this-that-${hostName.toLowerCase()}-${guestName.toLowerCase()}-${report.matchPercentage}pct.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function shareResultCard(
  report: FinalReport,
  hostName: string,
  guestName: string
): Promise<boolean> {
  const canvas = await generateResultCardCanvas(report, hostName, guestName);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return resolve(false);

      const file = new File([blob], 'this-that-match.png', { type: 'image/png' });
      const shareText = `⚡ THIS ⚡ THAT ⚡\n${hostName} & ${guestName} matched ${report.matchPercentage}%!\n"${report.headline}"\n\nPlay now: ${window.location.origin}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'THIS ⚡ THAT Match Result',
            text: shareText,
            files: [file],
          });
          return resolve(true);
        } catch (err) {
          if ((err as Error).name === 'AbortError') return resolve(false);
        }
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'THIS ⚡ THAT Match Result',
            text: shareText,
            url: window.location.origin,
          });
          return resolve(true);
        } catch (err) {
          if ((err as Error).name === 'AbortError') return resolve(false);
        }
      }

      resolve(false);
    }, 'image/png');
  });
}
