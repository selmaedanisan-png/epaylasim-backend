import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { emailLayout } from './templates/layout';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('mail.host'),
      port: config.get<number>('mail.port'),
      secure: config.get<number>('mail.port') === 465,
      auth: {
        user: config.get('mail.user'),
        pass: config.get('mail.pass'),
      },
    });
  }

  private get fromAddress(): string {
    return this.config.get('mail.from');
  }

  private get adminEmail(): string {
    return this.config.get('mail.adminEmail');
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html: emailLayout(subject, html),
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Email failed to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendToAdmin(subject: string, html: string): Promise<void> {
    return this.send(this.adminEmail, subject, html);
  }

  // ─── İletişim Formu ─────────────────────────────────────────
  async sendContactNotification(data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    const html = `
      <h2 style="color:#1a1a2e;margin-bottom:16px">Yeni İletişim Mesajı</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 12px;font-weight:600;color:#64748b;width:100px">Ad Soyad</td><td style="padding:8px 12px">${data.name}</td></tr>
        <tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#64748b">E-posta</td><td style="padding:8px 12px"><a href="mailto:${data.email}" style="color:#C4175A">${data.email}</a></td></tr>
        ${data.subject ? `<tr><td style="padding:8px 12px;font-weight:600;color:#64748b">Konu</td><td style="padding:8px 12px">${data.subject}</td></tr>` : ''}
        <tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#64748b;vertical-align:top">Mesaj</td><td style="padding:8px 12px;line-height:1.6">${data.message.replace(/\n/g, '<br>')}</td></tr>
      </table>
      <p style="margin-top:20px;font-size:12px;color:#94a3b8">Bu mesaj epaylasim.com iletişim formundan gönderildi.</p>
    `;
    await this.sendToAdmin(`İletişim: ${data.subject || data.name}`, html);
  }

  async sendContactConfirmation(data: {
    name: string;
    email: string;
  }): Promise<void> {
    const html = `
      <h2 style="color:#1a1a2e;margin-bottom:16px">Mesajınızı Aldık!</h2>
      <p>Merhaba <strong>${data.name}</strong>,</p>
      <p>İletişim formumuz aracılığıyla gönderdiğiniz mesaj başarıyla alındı. Ekibimiz en kısa sürede size dönüş yapacaktır.</p>
      <p style="margin-top:24px;color:#64748b;font-size:13px">Ortalama yanıt süremiz 24 saattir.</p>
    `;
    await this.send(data.email, 'Mesajınız Alındı — e.paylaşım', html);
  }

  // ─── Katkı Bildirimi ────────────────────────────────────────
  async sendContributionConfirmation(data: {
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    wishItemName: string;
    message?: string;
  }): Promise<void> {
    const html = `
      <h2 style="color:#1a1a2e;margin-bottom:16px">Katkınız için Teşekkürler! 🎉</h2>
      <p>Merhaba <strong>${data.firstName}</strong>,</p>
      <p>Katkıda bulunma işleminiz başarıyla tamamlandı.</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;font-weight:600;color:#64748b">Ürün</td><td style="padding:6px 0;text-align:right">${data.wishItemName}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600;color:#64748b">Katkı Tutarı</td><td style="padding:6px 0;text-align:right;font-weight:800;color:#C4175A;font-size:18px">₺${data.amount.toLocaleString('tr-TR')}</td></tr>
          ${data.message ? `<tr><td style="padding:6px 0;font-weight:600;color:#64748b;vertical-align:top">Mesajınız</td><td style="padding:6px 0;text-align:right;font-style:italic;color:#64748b">"${data.message}"</td></tr>` : ''}
        </table>
      </div>
      <p style="color:#64748b">Hediyeye bir adım daha yaklaştırdınız. Sevdikleriniz çok mutlu olacak!</p>
    `;
    await this.send(data.email, 'Katkınız Alındı — e.paylaşım', html);
  }

  async sendContributionNotificationToAdmin(data: {
    firstName: string;
    lastName: string;
    email: string;
    amount: number;
    wishItemName: string;
  }): Promise<void> {
    const html = `
      <h2 style="color:#1a1a2e;margin-bottom:16px">Yeni Katkı Alındı! 💰</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 12px;font-weight:600;color:#64748b;width:120px">Katkıcı</td><td style="padding:8px 12px">${data.firstName} ${data.lastName}</td></tr>
        <tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#64748b">E-posta</td><td style="padding:8px 12px">${data.email}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:600;color:#64748b">Ürün</td><td style="padding:8px 12px">${data.wishItemName}</td></tr>
        <tr style="background:#f8fafc"><td style="padding:8px 12px;font-weight:600;color:#C4175A;font-size:16px">Tutar</td><td style="padding:8px 12px;font-weight:800;color:#C4175A;font-size:18px">₺${data.amount.toLocaleString('tr-TR')}</td></tr>
      </table>
    `;
    await this.sendToAdmin(`Yeni Katkı: ₺${data.amount} — ${data.wishItemName}`, html);
  }

  // ─── Newsletter ─────────────────────────────────────────────
  async sendWelcomeNewsletter(data: {
    email: string;
    name?: string;
  }): Promise<void> {
    const html = `
      <h2 style="color:#1a1a2e;margin-bottom:16px">Bültene Hoş Geldiniz! 📬</h2>
      <p>Merhaba${data.name ? ` <strong>${data.name}</strong>` : ''},</p>
      <p>e.paylaşım bültenine başarıyla abone oldunuz. Artık kampanya haberleri, özel indirimler ve yeni özellikler hakkında ilk siz bilgilendirileceksiniz.</p>
      <div style="text-align:center;margin:28px 0">
        <a href="${process.env.FRONTEND_URL || 'https://epaylasim.com'}" style="background:#C4175A;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;display:inline-block">Platformu Keşfet</a>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px">Abonelikten çıkmak için <a href="${process.env.FRONTEND_URL || 'https://epaylasim.com'}/unsubscribe?email=${encodeURIComponent(data.email)}" style="color:#C4175A">buraya tıklayın</a>.</p>
    `;
    await this.send(data.email, 'Bültene Hoş Geldiniz — e.paylaşım', html);
  }

  async sendBulkNewsletter(
    recipients: { email: string; name?: string }[],
    subject: string,
    content: string,
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      try {
        const html = `
          <div style="line-height:1.7">${content}</div>
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0">
          <p style="font-size:12px;color:#94a3b8">Bu e-posta e.paylaşım bülteni aboneliğiniz kapsamında gönderilmiştir.<br>
          <a href="${process.env.FRONTEND_URL || 'https://epaylasim.com'}/unsubscribe?email=${encodeURIComponent(r.email)}" style="color:#C4175A">Abonelikten çık</a></p>
        `;
        await this.send(r.email, subject, html);
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }
}
