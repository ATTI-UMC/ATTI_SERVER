const db = require('../config/db');

class GroupChatDao {
    async createGroupChat(userId, content) {
      const [result] = await db.execute(
        'INSERT INTO GroupChatRoom (user_id, content) VALUES (?, ?)', 
        [userId, content]
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
  }
  
  module.exports = new GroupChatDao();