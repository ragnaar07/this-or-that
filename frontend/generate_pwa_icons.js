import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 implementation for PNG chunks
function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = makeCRCTable();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  // Raw RGBA scanlines
  // Filter byte (1 byte per row) + width * 4 bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #FFF176 (255, 241, 118)
      let r = 255;
      let g = 241;
      let b = 118;
      let a = 255;

      // Circle badge in center
      if (dist <= rOuter) {
        // Inner circle gradient #FF3EA5 to #7B2FF7
        const t = (dy + rOuter) / (2 * rOuter);
        r = Math.round(255 * (1 - t) + 123 * t);
        g = Math.round(62 * (1 - t) + 47 * t);
        b = Math.round(165 * (1 - t) + 247 * t);

        // Lightning bolt in center
        const nx = (x - cx) / (width * 0.25);
        const ny = (y - cy) / (height * 0.32);

        // Simple bolt polygon shape check
        let isBolt = false;
        if (ny >= -1 && ny <= 1) {
          if (ny < 0.1 && nx > -0.5 - ny * 0.4 && nx < 0.4 - ny * 0.3) isBolt = true;
          if (ny >= -0.1 && nx > -0.3 - ny * 0.3 && nx < 0.6 - ny * 0.5) isBolt = true;
        }

        if (isBolt) {
          r = 255;
          g = 241;
          b = 118;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Non-interlaced

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192, 512x512, apple-touch-icon (180x180), and maskable
const icon192 = generatePng(192);
const icon512 = generatePng(512);
const icon180 = generatePng(180);

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), icon512);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), icon180);

console.log('✅ Generated PWA icons: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png');
