const db = require('../config/db');

class GroupChatDao {
    async createGroupChat(userId, title, interest_tags) {
    const [result] = await db.execute(
      'INSERT INTO GroupChatRoom (user_id, title, interest_tags) VALUES ( ?, ?, ?)', 
      [userId, title, interest_tags]
    );
    return result.insertId;
    }

    async getGroupChats() {
      const [rows] = await db.execute('SELECT * FROM GroupChatRoom');
      return rows;
    }
  
    async getGroupChatById(id) {
      const [rows] = await db.execute('SELECT * FROM GroupChatRoom WHERE group_chatroom_id = ?', [id]);
      return rows[0];
    }
  
    async addMessage(groupChatRoomId, userId, content) {
      const [result] = await db.execute(
        'INSERT INTO GroupChatMessage (group_chatroom_id, user_id, content) VALUES (?, ?, ?)', 
        [groupChatRoomId, userId, content]
      );
      return result.insertId;
    }
  
    async getMessages(groupChatRoomId) {
      const [rows] = await db.execute(
        'SELECT * FROM GroupChatMessage WHERE group_chatroom_id = ?', 
        [groupChatRoomId]
      );
      return rows;
    }
    async deleteMessage(messageId) {
      await db.execute('DELETE FROM GroupChatMessage WHERE message_id = ?', [messageId]);
    }
  
    async deleteGroupChat(id) {
      await db.execute('DELETE FROM GroupChatMessage WHERE group_chatroom_id = ?', [id]);
      await db.execute('DELETE FROM GroupChatRoom WHERE group_chatroom_id = ?', [id]);
    }
    
    async findGroupChatByMBTI(mbti) {
      const [rows] = await db.execute(`
        SELECT gcr.* 
        FROM GroupChatRoom gcr
        JOIN User u ON gcr.user_id = u.userid
        WHERE u.mbti_fk = ?
        ORDER BY RAND()
      `, [mbti]);
      return rows[0];
    }
    
    async getRandomGroupChat() {
      const [rows] = await db.execute('SELECT * FROM GroupChatRoom ORDER BY RAND() LIMIT 1');
      return rows[0];
    }
  }
  
  module.exports = new GroupChatDao();