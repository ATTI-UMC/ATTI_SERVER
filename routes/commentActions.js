const express = require('express');
const router = express.Router();
const { connection } = require('./index'); // DB 연결 설정
const { checkAuthenticated } = require('./auth'); // 인증 미들웨어

// 댓글 소유권 확인 미들웨어
function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    const commentId = req.params.commentId; // URL에서 댓글 ID 가져오기
    const checkCommentQuery = 'SELECT * FROM Comment WHERE comment_id = ?';

    connection.query(checkCommentQuery, [commentId], (err, results) => {
      if (err || results.length === 0) {
        req.flash('error', '댓글을 찾는 도중에 에러가 발생했습니다.');
        return res.redirect('back');
      }

      const comment = results[0];
      if (comment.user_id === req.user.userid) {
        req.comment = comment; // 요청 객체에 댓글 정보 추가
        return next();
      } else {
        req.flash('error', '권한이 없습니다.');
        return res.redirect('back');
      }
    });
  } else {
    req.flash('error', '로그인을 해주세요.');
    res.redirect('/login');
  }
}

// 댓글 삭제 라우트
router.delete('/:commentId', checkCommentOwnership, (req, res) => {
  const commentId = req.params.commentId;
  const deleteCommentQuery = 'DELETE FROM Comment WHERE comment_id = ?';

  connection.query(deleteCommentQuery, [commentId], (err) => {
    if (err) {
      req.flash('error', '댓글 삭제 중 에러가 발생했습니다.');
      return res.redirect('back');
    }

    req.flash('success', '댓글을 삭제했습니다.');
    res.redirect('back');
  });
});

// 댓글 수정 페이지 렌더링 라우트
router.get('/:commentId/edit', checkCommentOwnership, (req, res) => {
  const commentId = req.params.commentId;
  const checkPostQuery = 'SELECT * FROM Post WHERE id = ?';

  connection.query(checkPostQuery, [commentId], (err, post) => {
    if (err || !post) {
      req.flash('error', '댓글에 해당하는 게시글이 없거나 에러가 발생했습니다.');
      return res.redirect('back');
    }
    res.render('comments/edit', { post: post, comment: req.comment });
  });
});

// 댓글 수정 라우트
router.put('/:commentId', checkCommentOwnership, (req, res) => {
  const commentId = req.params.commentId;
  const content = req.body.content; // 요청 본문에서 수정할 댓글 내용 가져오기
  const updateCommentQuery = 'UPDATE Comment SET content = ? WHERE comment_id = ?';

  connection.query(updateCommentQuery, [content, commentId], (err) => {
    if (err) {
      req.flash('error', '댓글을 수정하는데 에러가 났습니다.');
      return res.redirect('back');
    }

    req.flash('success', '댓글을 수정하는데 성공했습니다.');
    res.redirect('/posts'); // 수정 후 게시물 페이지로 리다이렉트
  });
});

module.exports = router;
