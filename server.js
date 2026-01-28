const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();

// 정적 파일 서빙 (현재 디렉토리의 html, css, js)
app.use(express.static(__dirname));
app.use(express.json());

// ----------------------------------------------------------------
// [설정] Gmail SMTP 설정
// 주의: 2단계 인증을 사용하는 경우, '앱 비밀번호(App Password)'를 생성해서 사용해야 합니다.
// ----------------------------------------------------------------
const SMTP_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'kimheesun107@gmail.com',  // [변경 필요] 본인 Gmail 주소
        pass: 'rvly rwpu kpwd pdhd'      // [변경 필요] Gmail 앱 비밀번호 (16자리)
    }
};

const transporter = nodemailer.createTransport(SMTP_CONFIG);

// 이메일 발송 API
app.post('/api/report', async (req, res) => {
    const { email, name, payscore, credit_min, credit_max } = req.body;

    console.log(`[Server] Sending report to: ${email} (${name})`);

    const mailOptions = {
        from: `"PayTrace" <${SMTP_CONFIG.auth.user}>`,
        to: email,
        subject: `[PayTrace] ${name}님의 PayScore 분석 리포트가 도착했습니다.`,
        html: `
            <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #4263eb; border-bottom: 2px solid #4263eb; padding-bottom: 10px;">PayTrace</h1>
                <p>안녕하세요, <strong>${name}</strong>님.</p>
                <p>요청하신 월세 납부 내역 기반 <strong>PayScore Analysis Report</strong>입니다.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #666;">나의 예상 PayScore</p>
                    <h2 style="margin: 10px 0; font-size: 32px; color: #4263eb;">${payscore}점</h2>
                    <p style="margin: 0; font-size: 14px; color: #666;">(100점 만점 기준)</p>
                </div>

                <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0; font-size: 16px;">📉 신용점수 영향 예측</h3>
                    <ul style="line-height: 1.8;">
                        <li><strong>NICE:</strong> +${credit_min} ~ ${credit_max}점 상승 예상</li>
                        <li><strong>KCB:</strong> +${credit_min} ~ ${credit_max}점 상승 예상</li>
                    </ul>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    ※ 본 메일은 발신 전용이며, 예측된 점수는 실제 금융사의 심사 기준과 다를 수 있습니다.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('[Server] Email sent successfully');
        res.json({ ok: true });
    } catch (error) {
        console.error('===============================================');
        console.error('[Server] Email send failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
        console.error('===============================================');

        res.status(500).json({
            ok: false,
            error: error.message,
            details: error.response, // 상세 정보 클라이언트에 전달
            reason_code: "SMTP_ERROR"
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` PayScore Server running at http://localhost:${PORT}`);
    console.log(`===============================================`);
});
