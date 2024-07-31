const express = require('express');
const router = express.Router();
const { connection } = require('./index'); // DB 연결 설정
const { checkAuthenticated } = require('./auth'); // 인증 미들웨어

// 모든 댓글 조회 라우트 (작성자의 정보 포함)
router.get('/', checkAuthenticated, (req, res) => {
  const getAllCommentsQuery = `
    SELECT Comment.*, User.username, User.MBTI_FK 
    FROM Comment 
    JOIN User ON Comment.user_id = User.userid
  `;

  connection.query(getAllCommentsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(results); // JSON 형식으로 모든 댓글 반환
    }
  });
});

// 특정 게시물의 댓글 목록 조회 라우트 (작성자의 정보 포함)
router.get('/:board_id', checkAuthenticated, (req, res) => {
  const boardId = req.params.board_id; // URL에서 게시물 ID 가져오기

  const getCommentsQuery = `
    SELECT Comment.*, User.username, User.MBTI_FK 
    FROM Comment 
    JOIN User ON Comment.user_id = User.userid 
    WHERE Comment.board_id = ?
  `;

  connection.query(getCommentsQuery, [boardId], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(results); // JSON 형식으로 댓글 목록 반환
    }
  });
});

// 댓글 생성 라우트
router.post('/:board_id', checkAuthenticated, (req, res) => {
  const boardId = req.params.board_id; // URL에서 게시물 ID 가져오기
  const content = req.body.content; // 요청 본문에서 댓글 내용 가져오기
  const userId = req.user.userid; // 현재 로그인한 사용자의 ID

  // 게시물 존재 여부 확인 쿼리
  const checkBoardQuery = 'SELECT * FROM Board WHERE board_id = ?';

  connection.query(checkBoardQuery, [boardId], (err, boardResults) => {
    if (err || boardResults.length === 0) {
      // 게시물을 찾지 못했거나 오류가 발생한 경우
      req.flash('error', '댓글을 생성 중 포스트를 찾지 못했거나 에러가 발생했습니다.');
      return res.redirect('back');
    }

    // 댓글 생성 쿼리
    const createCommentQuery = 'INSERT INTO Comment (board_id, user_id, content) VALUES (?, ?, ?)';

    connection.query(createCommentQuery, [boardId, userId, content], (err, result) => {
      if (err) {
        // 댓글 생성 중 오류가 발생한 경우
        req.flash('error', '댓글을 생성 중 에러가 발생했습니다.');
        return res.redirect('back');
      }

      // 댓글 생성이 성공한 경우, 댓글 ID를 사용하여 포스트에 저장
      const commentId = result.insertId;

      // 게시물에 댓글 ID 추가
      const updateBoardQuery = 'UPDATE Board SET comments = JSON_ARRAY_APPEND(comments, "$", ?) WHERE board_id = ?';

      connection.query(updateBoardQuery, [commentId, boardId], (err) => {
        if (err) {
          req.flash('error', '댓글을 포스트에 저장하는 중 에러가 발생했습니다.');
          return res.redirect('back');
        }

        // 댓글 생성이 성공한 경우
        req.flash('success', '댓글이 잘 생성되었습니다.');
        res.redirect('back');
      });
    });
  });
});

module.exports = router;
