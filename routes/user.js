const express = require('express');
const router = express.Router();

router.get('/mbti', (req, res) => {
  res.send(`
    <form action="/user/mbti" method="POST">
      <label for="mbti">Enter your MBTI:</label>
      <input type="text" id="mbti" name="mbti" required>
      <button type="submit">Submit</button>
    </form>
  `);
});

router.post('/mbti', async (req, res) => {
  const { mbti } = req.body;
  const { user } = req.session;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  try {
    await createUser(user, mbti);
    res.redirect('/profile');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('An error occurred');
  }
});

module.exports = router;