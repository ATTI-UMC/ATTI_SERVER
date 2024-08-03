const nodemailer = require('nodemailer');
require('dotenv').config();

class JoinService {
  static verificationCodes = new Map();

  static async sendVerificationEmail(email) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 이메일 전송 
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "이메일 인증",
      text: `귀하의 인증 코드는 ${verificationCode} 입니다. 이 코드는 10분 동안 유효합니다.`,
      html: `<b>귀하의 인증 코드는 ${verificationCode} 입니다. 이 코드는 10분 동안 유효합니다.</b>`,
    });

    // 인증 코드를 메모리에 저장하고 10분 후 만료
    JoinService.verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 600000 // 현재 시간 + 10분
    });

    // 10분 후 삭제
    setTimeout(() => {
      JoinService.verificationCodes.delete(email);
    }, 600000);

    return verificationCode;
  }

  static async verifyCode(email, code) {
    const storedData = JoinService.verificationCodes.get(email);
    
    if (!storedData) {
      return false; // 이메일에 대한 인증 코드가 없음
    }

    if (Date.now() > storedData.expiresAt) {
      JoinService.verificationCodes.delete(email);
      return false; // 인증 코드가 만료됨
    }

    if (storedData.code === code) {
      JoinService.verificationCodes.delete(email); // 성공적으로 인증되면 코드 삭제
      return true;
    }

    return false; // 잘못된 인증 코드
  }
}
//FM 방식 - DB에 Verification 저장인데... 일단 진행

module.exports = JoinService;