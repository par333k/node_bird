const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user ? req.user.Followers.map(f => f.id) : [];
    res.locals.followingIdList = req.user ? req.user.Followings.map(f => f.id) : [];
    next();
});

router.get('/profile', isLoggedIn, (req, res) => {
    console.log(res);
    res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', { title: '회원가입 - NodeBird' });
});

router.get('/', async (req, res, next) => {
   try {
       const posts = await Post.findAll({
            include: [{ // 작성자
              model: User,
              attributes: ['id', 'nick'],
            }, { // 좋아요 누른 사람들
              model: User,
              attributes: ['id', 'nick'],
              as: 'Liker',
            }],
           order: [['createdAt', 'DESC']]
       });
       let like = [];
       for (let i = 0; i < posts.length; i++) {
           like.push(posts[i].Liker.map(l => l.id));
       };

       like = like.flat(Infinity);
       console.log(like);
       res.render('main', {
           title: 'NodeBird',
           twits: posts,
           likes: like,
       });
   } catch (err) {
       console.error(err);
       next(err);
   }

});

router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
    }

    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }

        return res.render('main', {
           title: `${query} | NodeBird`,
           twits: posts,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;