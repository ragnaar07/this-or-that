// ============================================================
// Client-Side Canvas Social Card Generator (1080 x 1350 PNG)
// Zero server upload, runs 100% in the browser
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

  // Subtle decorative dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let x = 30; x < width; x += 40) {
    for (let y = 30; y < height; y += 40) {
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
  ctx.font = '900 68px "Outfit", system-ui, sans-serif';
  ctx.fillText('THIS ', width / 2 - 130, 130);

  ctx.fillStyle = '#FFD600';
  ctx.font = '900 74px "Outfit", system-ui, sans-serif';
  ctx.fillText('⚡', width / 2 - 10, 130);

  ctx.fillStyle = '#7B2FBE';
  ctx.font = '900 68px "Outfit", system-ui, sans-serif';
  ctx.fillText(' THAT', width / 2 + 130, 130);

  ctx.fillStyle = '#71717A';
  ctx.font = '800 24px "Outfit", system-ui, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('SYNC UP. MATCH MINDS.', width / 2, 175);

  // --- MAIN CARD (Cream Container) ---
  const cardX = 80;
  const cardY = 220;
  const cardW = width - 160;
  const cardH = 920;
  const cardR = 36;

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

  // Player Names Pill
  ctx.fillStyle = '#18181B';
  ctx.font = '800 32px "Outfit", system-ui, sans-serif';
  ctx.fillText(`${hostName.toUpperCase()}  ⚡  ${(guestName || 'GUEST').toUpperCase()}`, width / 2, cardY + 70);

  // Match Percentage Big Pill
  const pillW = 440;
  const pillH = 90;
  const pillX = width / 2 - pillW / 2;
  const pillY = cardY + 110;

  ctx.fillStyle = '#18181B';
  roundRect(ctx, pillX + 6, pillY + 6, pillW, pillH, 45);
  ctx.fill();

  ctx.fillStyle = '#00E5A0'; // Mint Green
  roundRect(ctx, pillX, pillY, pillW, pillH, 45);
  ctx.fill();
  ctx.strokeStyle = '#18181B';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#18181B';
  ctx.font = '900 52px "Outfit", system-ui, sans-serif';
  ctx.fillText(`${report.matchPercentage}% MATCH`, width / 2, pillY + 64);

  // Score Subtitle
  ctx.fillStyle = '#71717A';
  ctx.font = '800 26px "Outfit", system-ui, sans-serif';
  const matchText = report.isPartial
    ? `${report.completedQuestions} QUESTIONS COMPLETED (PARTIAL)`
    : `${Math.round((report.matchPercentage / 100) * report.completedQuestions)} / ${report.completedQuestions} MATCHED`;
  ctx.fillText(matchText, width / 2, cardY + 245);

  // Headline
  ctx.fillStyle = '#FF3CAC';
  ctx.font = '900 42px "Outfit", system-ui, sans-serif';
  wrapText(ctx, report.headline, width / 2, cardY + 310, cardW - 80, 50);

  // Divider line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 8]);
  ctx.beginPath();
  ctx.moveTo(cardX + 40, cardY + 410);
  ctx.lineTo(cardX + cardW - 40, cardY + 410);
  ctx.stroke();
  ctx.setLineDash([]); // reset

  // Section 1: Strongest Matches
  ctx.textAlign = 'left';
  ctx.fillStyle = '#7B2FBE';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('⚡ SAME BRAIN HIGHLIGHTS', cardX + 50, cardY + 460);

  ctx.fillStyle = '#18181B';
  ctx.font = '600 26px "Outfit", system-ui, sans-serif';
  const matchHighlights = report.strongestMatches.slice(0, 2);
  let curY = cardY + 505;
  for (const m of matchHighlights) {
    ctx.fillText(`•  ${m}`, cardX + 50, curY);
    curY += 40;
  }

  // Section 2: Chaos Award (Funniest Difference)
  curY += 20;
  ctx.fillStyle = '#FF3CAC';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('😂 CHAOS AWARD', cardX + 50, curY);

  curY += 45;
  ctx.fillStyle = '#27272A';
  ctx.font = 'italic 600 25px "Outfit", system-ui, sans-serif';
  const chaosText = `"${report.funniestDifference}"`;
  curY = wrapText(ctx, chaosText, cardX + 50, curY, cardW - 100, 36, false);

  // Section 3: Final Vibe Verdict
  curY += 30;
  ctx.fillStyle = '#18181B';
  ctx.font = '900 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('🔮 THE VERDICT', cardX + 50, curY);

  curY += 45;
  ctx.fillStyle = '#3F3F46';
  ctx.font = '500 24px "Outfit", system-ui, sans-serif';
  wrapText(ctx, report.finalVerdict, cardX + 50, curY, cardW - 100, 34, false);

  // --- FOOTER ---
  ctx.textAlign = 'center';
  ctx.fillStyle = '#18181B';
  ctx.font = '800 24px "Outfit", system-ui, sans-serif';
  ctx.fillText('Play with your friends on THIS ⚡ THAT', width / 2, height - 80);

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
  return currentY;
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
  a.download = `this-that-match-${report.matchPercentage}pct.png`;
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
      const shareText = `⚡ THIS ⚡ THAT ⚡\n${hostName} & ${guestName} matched ${report.matchPercentage}%!\n"${report.headline}"\n\nPlay now!`;

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

      // Fallback to text-only Web Share
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
