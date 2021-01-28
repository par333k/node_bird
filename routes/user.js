const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { addFollowing } = require('../controllers/user');
const User = require('../models/user');

const router = express.Router();

// 라우터를 컨트롤러와 분리
router.post('/:id/follow', isLoggedIn, addFollowing);

router.delete('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne( { where: { id: req.user.id } });
        if (user) {
            await user.removeFollowing(parseInt(req.params.id, 10));
            res.send('success');
        } else {
            res.status(404).send('no user');
        }
    } catch (error) {
        console.error(error)
        next(error)
    }
});

module.exports = router;