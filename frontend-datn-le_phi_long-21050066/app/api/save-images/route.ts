import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const exerciseName = sanitize(String(form.get('exerciseName') || ''));
    const label = sanitize(String(form.get('label') || ''));
    const indexStr = String(form.get('index') || '');
    const index = Number(indexStr);
    const file = form.get('file') as File | null;

    if (!exerciseName || !label || !index || !file) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), 'public', 'images', exerciseName, label);
    await fs.promises.mkdir(baseDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Lấy phần mở rộng từ tên hoặc mime
    let ext = path.extname(file.name).toLowerCase();
    if (!ext) ext = file.type === 'image/png' ? '.png' : '.jpg';

    const filename = `img_${index}_${Date.now().toString()}_${ext}`;
    const filePath = path.join(baseDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ ok: true, file: `/images/${exerciseName}/${label}/${filename}` });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}

function sanitize(s: string) {
  return (s || '').replace(/[^a-zA-Z0-9_\-]/g, '_');
}
