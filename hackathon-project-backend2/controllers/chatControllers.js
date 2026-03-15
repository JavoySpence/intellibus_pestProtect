import {pool }from "../database/database.js";


export const addToChatHistory = async (req, res) => {
  
    const { user_id, message } = req.body;
    console.log("Received data:", req.body);
    if (!user_id || !message) {
      return res.status(400).json({ success: false, message: "Missing user_id or message" });
    }

    // Insert into MySQL chat_history table
    const [result] = await pool.query(
      'INSERT INTO chat_history (user_id, message) VALUES (?, ?)',
      [user_id, message]
    );

    if (result.affectedRows){
      res.status(201).json({
      success: true,
      chatId: result.insertId,
      user_id,
      message
    });
    }
   

}

export const addToChatHistory2 = async (req, res) => {
  
    const { user_id, message } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ success: false, message: "Missing user_id or message" });
    }

    // Insert into MySQL chat_history table
    const [result] = await pool.query(
      'INSERT INTO chat_history (user_id, message) VALUES (?, ?)',
      [user_id, message]
    );

    if (result.affectedRows){
      res.status(201).json({
      success: true,
      chatId: result.insertId,
      user_id,
      message
    });
    }
   

}

export const getUserChatHistory = async (req, res, next) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "No user_id provided" });
    }

    console.log("user_id received:", user_id);

    const [result] = await pool.query("SELECT message FROM chat_history WHERE user_id = ?", [user_id]);

    return res.status(200).json({
        success: true,
        message: "chat history fetched successfully",
        data: result || []
    });
};



