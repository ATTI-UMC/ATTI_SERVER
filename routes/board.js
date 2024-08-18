const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// AWS S3 설정
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// S3에 파일 업로드 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}_${path.basename(file.originalname)}`);
    }
  })
});

// 게시글 생성 라우터
router.post('/', upload.array('images'), (req, res) => {
  const { board_type, user_id, nickname, title, content } = req.body;
  const imageUrls = req.files.map(file => file.location);  // S3에 저장된 이미지 URL 배열 생성

  const query = 'INSERT INTO Board (board_type, user_id, nickname, title, content) VALUES (?, ?, ?, ?, ?)';
  
  connection.query(query, [board_type, user_id, nickname, title, content], (err, result) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }
    
    const postId = result.insertId;  // 생성된 게시글의 ID

    // 이미지 URL을 BoardImages 테이블에 저장하는 쿼리
    const imageInsertQuery = 'INSERT INTO BoardImages (board_id, image_url) VALUES ?';
    const imageInsertValues = imageUrls.map(url => [postId, url]);  // 각 URL과 게시글 ID를 매핑

    connection.query(imageInsertQuery, [imageInsertValues], (err) => {
      if (err) {
        console.error('이미지 URL 저장 실패: ' + err.stack);
        res.status(500).send('서버 오류');
        return;
      }

      // 게시글 생성 후, 상세 페이지로 리디렉션
      res.redirect(`/board/${postId}`);
    });
  });
});


// 게시글 조회 라우터 (단일 게시글)
router.get('/:id', (req, res) => {
  const postId = req.params.id;

  // 게시글 정보를 가져오는 쿼리
  const query = `
    SELECT b.*, 
           (SELECT COUNT(*) FROM Likes WHERE board_id = ?) AS like_count,
           (SELECT COUNT(*) FROM Comment WHERE board_id = ?) AS comment_count,
           (SELECT COUNT(*) FROM Scraps WHERE board_id = ?) AS scarp_count
    FROM Board b
    WHERE b.board_id = ?`;

  connection.query(query, [postId, postId, postId, postId], (err, boardResults) => {
    if (err) {
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }
    
    if (boardResults.length === 0) {
      res.status(404).send('게시글을 찾을 수 없습니다.');
      return;
    }

    const boardData = boardResults[0];

    // 이미지 URL을 가져오는 쿼리
    const imageQuery = 'SELECT image_url FROM BoardImages WHERE board_id = ?';

    connection.query(imageQuery, [postId], (err, imageResults) => {
      if (err) {
        console.error('쿼리 실행 실패: ' + err.stack);
        res.status(500).send('서버 오류');
        return;
      }

      // 댓글 정보를 가져오는 쿼리
      const commentQuery = `
        SELECT c.comment_id, c.user_id, u.nickname, c.content, c.timestamp
        FROM Comment c
        JOIN User u ON c.user_id = u.userid
        WHERE c.board_id = ?`;

      connection.query(commentQuery, [postId], (err, commentResults) => {
        if (err) {
          console.error('쿼리 실행 실패: ' + err.stack);
          res.status(500).send('서버 오류');
          return;
        }

        // 최종 응답 데이터 구성
        res.json({
          ...boardData,
          images: imageResults.map(img => img.image_url),  // 이미지 URL 배열로 추가
          comments: commentResults  // 댓글 정보 추가
        });
      });
    });
  });
});



// 게시글 수정 라우터
router.put('/:id', upload.array('images'), (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const newImageUrls = req.files.map(file => file.location);  // 새로 업로드된 이미지 URL 배열

  // 1. 기존 게시글 데이터 업데이트 (title, content)
  const updateQuery = 'UPDATE Board SET title = ?, content = ? WHERE board_id = ?';
  
  connection.query(updateQuery, [title, content, postId], (err) => {
    if (err) {
      console.error('게시글 수정 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    // 2. 기존 이미지 URL 삭제 로직
    const getImageUrlsQuery = 'SELECT image_url FROM BoardImages WHERE board_id = ?';
    
    connection.query(getImageUrlsQuery, [postId], (err, oldImageResults) => {
      if (err) {
        console.error('기존 이미지 URL 조회 실패: ' + err.stack);
        res.status(500).send('서버 오류');
        return;
      }

      const oldImageUrls = oldImageResults.map(img => img.image_url);

      // S3에서 기존 이미지 삭제
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
          Objects: oldImageUrls.map(url => ({ Key: url.split('/').pop() }))
        }
      };

      s3.deleteObjects(deleteParams, (err) => {
        if (err) {
          console.error('기존 이미지 삭제 실패: ' + err.stack);
          res.status(500).send('서버 오류');
          return;
        }

        // RDS에서 기존 이미지 URL 삭제
        const deleteImageQuery = 'DELETE FROM BoardImages WHERE board_id = ?';
        
        connection.query(deleteImageQuery, [postId], (err) => {
          if (err) {
            console.error('기존 이미지 URL 삭제 실패: ' + err.stack);
            res.status(500).send('서버 오류');
            return;
          }

          // 3. 새 이미지 URL 저장
          if (newImageUrls.length > 0) {
            const insertImageQuery = 'INSERT INTO BoardImages (board_id, image_url) VALUES ?';
            const imageInsertValues = newImageUrls.map(url => [postId, url]);

            connection.query(insertImageQuery, [imageInsertValues], (err) => {
              if (err) {
                console.error('새 이미지 URL 저장 실패: ' + err.stack);
                res.status(500).send('서버 오류');
                return;
              }

              // 수정된 게시글로 리디렉션
              res.redirect(`/board/${postId}`);
            });
          } else {
            // 이미지가 없는 경우 바로 리디렉션
            res.redirect(`/board/${postId}`);
          }
        });
      });
    });
  });
});

// 게시글 삭제 라우터
router.delete('/:id', (req, res) => {
  const postId = req.params.id;

  // 1. 관련 이미지 URL 가져오기
  const getImageUrlsQuery = 'SELECT image_url FROM BoardImages WHERE board_id = ?';

  connection.query(getImageUrlsQuery, [postId], (err, imageResults) => {
    if (err) {
      console.error('기존 이미지 URL 조회 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    const imageUrls = imageResults.map(img => img.image_url);

    // 2. S3에서 관련 이미지 삭제
    if (imageUrls.length > 0) {
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
          Objects: imageUrls.map(url => ({ Key: url.split('/').pop() }))
        }
      };

      s3.deleteObjects(deleteParams, (err) => {
        if (err) {
          console.error('S3에서 이미지 삭제 실패: ' + err.stack);
          res.status(500).send('서버 오류');
          return;
        }

        console.log('이미지가 S3에서 삭제되었습니다.');
      });
    }

    // 3. 관련 테이블에서 데이터 삭제 (Scraps, Likes, Comments, BoardImages)
    const deleteRelatedTablesQuery = `
      DELETE FROM Scraps WHERE board_id = ?;
      DELETE FROM Likes WHERE board_id = ?;
      DELETE FROM Comment WHERE board_id = ?;
      DELETE FROM BoardImages WHERE board_id = ?;
      DELETE FROM Board WHERE board_id = ?;
    `;

    connection.query(deleteRelatedTablesQuery, [postId, postId, postId, postId, postId], (err) => {
      if (err) {
        console.error('게시글 관련 데이터 삭제 실패: ' + err.stack);
        res.status(500).send('서버 오류');
        return;
      }

      // 4. 삭제 완료 메시지 응답
      res.status(200).json({
        message: '게시글이 성공적으로 삭제되었습니다.'
      });
    });
  });
});


// 특정 board_type을 가진 게시글 조회 라우터
router.get('/boardtype/:board_type', (req, res) => {
  const boardType = req.params.board_type;

  // 쿼리 파라미터로부터 페이징 숫자를 가져옴 (한 번에 불러올 게시글 수)
  const pagingNum = parseInt(req.query.paging_num) || 10;

  // 쿼리 파라미터로부터 마지막으로 불러온 게시글의 created_at 값을 가져옴
  const lastCreatedAt = req.query.lastCreatedAt || null;

  // 기본 SQL 쿼리: 특정 board_type을 가진 게시글을 선택
  let query = `
    SELECT title, content, like_count, scrap_count, comment_count, updated_at, nickname
    FROM Board
    WHERE board_type = ?
  `;

  // 만약 lastCreatedAt이 제공되었다면, 그 이후에 생성된 게시글만 선택
  if (lastCreatedAt) {
    query += ` AND created_at > ?`;
  }

  // 최신 수정된 순으로 정렬하고, 최대 pagingNum 만큼의 게시글만 불러옴
  query += ` ORDER BY updated_at DESC LIMIT ?`;

  // 쿼리에 전달할 파라미터 배열을 설정
  const queryParams = lastCreatedAt ? [boardType, lastCreatedAt, pagingNum] : [boardType, pagingNum];

  // 데이터베이스에 쿼리 실행
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      // 쿼리 실행 실패 시 오류 메시지 반환
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    // 결과가 비어 있으면 더 이상 불러올 게시글이 없다는 메시지를 보냄
    if (results.length === 0) {
      res.json({ message: '더 이상 불러올 게시글이 없습니다.' });
    } else {
      // 결과가 있으면 결과를 JSON 형식으로 클라이언트에 응답
      res.json(results);
    }
  });
});

// 내가 좋아요 표시한 게시글을 최신 수정된 순으로 불러오는 라우터
router.get('/liked-posts', (req, res) => {
  // 요청 파라미터에서 필요한 값을 가져옴
  const userId = req.query.user_id;
  const pagingNum = parseInt(req.query.paging_num) || 10;
  const lastCreatedAt = req.query.lastCreatedAt || null;

  // 기본 SQL 쿼리: 특정 사용자가 좋아요 표시한 게시글을 선택
  let query = `
    SELECT b.title, b.content, b.comment_count, b.like_count, b.scrap_count, b.updated_at, u.nickname
    FROM Likes l
    JOIN Board b ON l.board_id = b.board_id
    JOIN User u ON b.user_id = u.userid
    WHERE l.user_id = ?
  `;

  // 만약 lastCreatedAt이 제공되었다면, 그 이후에 생성된 게시글만 선택
  if (lastCreatedAt) {
    query += ` AND b.updated_at > ?`;
  }

  // 최신 수정된 순으로 정렬하고, 최대 pagingNum 만큼의 게시글만 불러옴
  query += ` ORDER BY b.updated_at DESC LIMIT ?`;

  // 쿼리에 전달할 파라미터 배열을 설정
  const queryParams = lastCreatedAt 
    ? [userId, lastCreatedAt, pagingNum] 
    : [userId, pagingNum];

  // 데이터베이스에 쿼리 실행
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      // 쿼리 실행 실패 시 오류 메시지 반환
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    // 결과가 비어 있으면 더 이상 불러올 게시글이 없다는 메시지를 보냄
    if (results.length === 0) {
      res.json({ message: '더 이상 불러올 게시글이 없습니다.' });
    } else {
      // 결과가 있으면 결과를 JSON 형식으로 클라이언트에 응답
      res.json(results);
    }
  });
});



// 내가 스크랩한 게시글을 최신 수정된 순으로 불러오는 라우터
router.get('/scrapped-posts', (req, res) => {
  // 요청 파라미터에서 필요한 값을 가져옴
  const userId = req.query.user_id;
  const pagingNum = parseInt(req.query.paging_num) || 10;
  const lastCreatedAt = req.query.lastCreatedAt || null;

  // 기본 SQL 쿼리: 특정 사용자가 스크랩한 게시글을 선택
  let query = `
    SELECT b.title, b.content, b.comment_count, b.like_count, b.scrap_count, b.updated_at, u.nickname
    FROM Scraps s
    JOIN Board b ON s.board_id = b.board_id
    JOIN User u ON b.user_id = u.userid
    WHERE s.user_id = ?
  `;

  // 만약 lastCreatedAt이 제공되었다면, 그 이후에 생성된 게시글만 선택
  if (lastCreatedAt) {
    query += ` AND b.updated_at > ?`;
  }

  // 최신 수정된 순으로 정렬하고, 최대 pagingNum 만큼의 게시글만 불러옴
  query += ` ORDER BY b.updated_at DESC LIMIT ?`;

  // 쿼리에 전달할 파라미터 배열을 설정
  const queryParams = lastCreatedAt 
    ? [userId, lastCreatedAt, pagingNum] 
    : [userId, pagingNum];

  // 데이터베이스에 쿼리 실행
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      // 쿼리 실행 실패 시 오류 메시지 반환
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    // 결과가 비어 있으면 더 이상 불러올 게시글이 없다는 메시지를 보냄
    if (results.length === 0) {
      res.json({ message: '더 이상 불러올 게시글이 없습니다.' });
    } else {
      // 결과가 있으면 결과를 JSON 형식으로 클라이언트에 응답
      res.json(results);
    }
  });
});

// 내가 댓글 단 게시글을 최신 수정된 순으로 불러오는 라우터
router.get('/commented-posts', (req, res) => {
  // 요청 파라미터에서 필요한 값을 가져옴
  const userId = req.query.user_id;
  const pagingNum = parseInt(req.query.paging_num) || 10;
  const lastCreatedAt = req.query.lastCreatedAt || null;

  // 기본 SQL 쿼리: 특정 사용자가 댓글 단 게시글을 선택
  let query = `
    SELECT DISTINCT b.title, b.content, b.comment_count, b.like_count, b.scrap_count, b.updated_at, u.nickname
    FROM Comment c
    JOIN Board b ON c.board_id = b.board_id
    JOIN User u ON b.user_id = u.userid
    WHERE c.user_id = ?
  `;

  // 만약 lastCreatedAt이 제공되었다면, 그 이후에 생성된 게시글만 선택
  if (lastCreatedAt) {
    query += ` AND b.updated_at > ?`;
  }

  // 최신 수정된 순으로 정렬하고, 최대 pagingNum 만큼의 게시글만 불러옴
  query += ` ORDER BY b.updated_at DESC LIMIT ?`;

  // 쿼리에 전달할 파라미터 배열을 설정
  const queryParams = lastCreatedAt 
    ? [userId, lastCreatedAt, pagingNum] 
    : [userId, pagingNum];

  // 데이터베이스에 쿼리 실행
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      // 쿼리 실행 실패 시 오류 메시지 반환
      console.error('쿼리 실행 실패: ' + err.stack);
      res.status(500).send('서버 오류');
      return;
    }

    // 결과가 비어 있으면 더 이상 불러올 게시글이 없다는 메시지를 보냄
    if (results.length === 0) {
      res.json({ message: '더 이상 불러올 게시글이 없습니다.' });
    } else {
      // 결과가 있으면 결과를 JSON 형식으로 클라이언트에 응답
      res.json(results);
    }
  });
});

module.exports = router;