const JoinService = require('../service/JoinService');


class JoinController {
  static async joinRequest(req, res) {
    try {
      
      const { email } = req.body;

      if (!email.endsWith('@naver.com')) {
        return res.status(400).json({ message: '유효한 이메일이 아닙니다.' });
      }
      const verificationCode = await JoinService.sendVerificationEmail(email);
      res.status(200).json({ message: '인증 이메일이 전송되었습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }

//나중에 학교 버전으로 바꾸기...

  static async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;
      const isVerified = await JoinService.verifyCode(email, code);
      if (isVerified) {
        res.status(200).json({ message: '이메일이 성공적으로 인증되었습니다.' });
      } else {
        res.status(400).json({ message: '인증 코드가 유효하지 않습니다.' });
      }
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  }
}

module.exports = JoinController;