const express = require('express');
const router = express.Router();
const { connection } = require('./index'); // DB 연결 설정
const { checkAuthenticated } = require('./auth'); // 인증 미들웨어

// 댓글 좋아요 라우트
router.put('/:commentId/like', checkAuthenticated, (req, res) => {
  const commentId = req.params.commentId; // URL에서 댓글 ID 가져오기
  const userId = req.user.userid; // 현재 로그인한 사용자의 ID

  const checkCommentQuery = 'SELECT * FROM Comment WHERE comment_id = ?';

  connection.query(checkCommentQuery, [commentId], (err, results) => {
    if (err || results.length === 0) {
      req.flash('error', 'Comment not found');
      return res.redirect('back');
    }

    const comment = results[0];
    let likes = comment.likes ? JSON.parse(comment.likes) : [];

    if (likes.includes(userId.toString())) {
      // 이미 좋아요를 눌렀을 경우, 좋아요 제거
      likes = likes.filter(likeId => likeId !== userId.toString());
      const updateLikesQuery = 'UPDATE Comment SET likes = ? WHERE comment_id = ?';

      connection.query(updateLikesQuery, [JSON.stringify(likes), commentId], (err) => {
        if (err) {
          console.log(err);
          return res.redirect('back');
        }
        req.flash('success', '좋아요가 제거되었습니다.');
        res.redirect('back');
      });
    } else {
      // 처음 좋아요를 누를 경우, 좋아요 추가
      likes.push(userId.toString());
      const updateLikesQuery = 'UPDATE Comment SET likes = ? WHERE comment_id = ?';

      connection.query(updateLikesQuery, [JSON.stringify(likes), commentId], (err) => {
        if (err) {
          console.log(err);
          return res.redirect('back');
        }
        req.flash('success', '좋아요가 추가되었습니다.');
        res.redirect('back');
      });
    }
  });
});

module.exports = router;
