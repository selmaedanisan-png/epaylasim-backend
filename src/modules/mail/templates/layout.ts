export function emailLayout(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e1040,#3b0d2b);padding:28px 32px;text-align:center">
            <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px">e<span style="color:#DFA020">.</span>paylaşım</span>
            <br>
            <span style="font-size:10px;color:rgba(255,255,255,.5);letter-spacing:.3px">Türkiye'nin Sosyal Hediyeleşme Altyapısı</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 28px;color:#1a1a2e;font-size:14px;line-height:1.7">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #f1f5f9;text-align:center">
            <p style="margin:0 0 4px;font-size:11px;color:#94a3b8">&copy; 2026 e.paylaşım — Tüm hakları saklıdır.</p>
            <p style="margin:0;font-size:11px;color:#94a3b8">Fulya Mah. Yeşilçimen Sok. Polat Tower No:12/430, Şişli/İstanbul</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
