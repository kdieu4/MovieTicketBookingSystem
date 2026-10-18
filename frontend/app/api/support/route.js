import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu gửi lên không hợp lệ.' }, { status: 400 });
  }

  // Trường ẩn "website" chỉ bot mới điền: trả về thành công giả để bot bỏ qua
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || '').replace(/[\r\n]+/g, ' ').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ họ tên, email và nội dung.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Email liên hệ không hợp lệ.' }, { status: 400 });
  }
  if (name.length > 100 || message.length > 3000) {
    return NextResponse.json({ error: 'Nội dung vượt quá độ dài cho phép.' }, { status: 400 });
  }

  const { SMTP_USER, SMTP_PASS, SUPPORT_TO_EMAIL } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !SUPPORT_TO_EMAIL) {
    console.error('Thiếu biến môi trường SMTP_USER, SMTP_PASS hoặc SUPPORT_TO_EMAIL');
    return NextResponse.json({ error: 'Hệ thống chưa được cấu hình gửi email.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Seenema Support" <${SMTP_USER}>`,
      to: SUPPORT_TO_EMAIL,
      replyTo: email,
      subject: `[Seenema] Yêu cầu hỗ trợ từ ${name}`,
      text: `Họ và tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`,
      html: `
        <h3>Yêu cầu hỗ trợ mới</h3>
        <p>Họ và tên: ${escapeHtml(name)}</p>
        <p>Email liên hệ: ${escapeHtml(email)}</p>
        <p>Nội dung:</p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Gửi email thất bại:', err);
    return NextResponse.json({ error: 'Không gửi được yêu cầu. Vui lòng thử lại sau.' }, { status: 500 });
  }
}