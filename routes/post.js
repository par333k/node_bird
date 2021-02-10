const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limit: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
           content: req.body.content,
           img: req.body.url,
           UserId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if (hashtags) {
            const result = await Promise.all(
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            await post.addHashtags(result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
// 좋아요 취소
router.delete('/:id/like', isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.id }});
        console.log(post);
        // user 모델과 post 모델간 N:M 관계 모델에 설정
        // remove 메서드로 post모델의 as인 Likepost를 넣어서 through로 생성된 컬럼을 likepost에서 삭제
        // postId는 왜래키로 넘기기 때문에 post.addLikepost를 사용할 경우 userId가 파라미터가 됨
        await post.removeLiker(parseInt(req.user.id, 10));
        res.redirect('/');
    } catch(error) {
        console.error(error);
        next(error);
    }
});

// 좋아요
router.post('/:id/like', isLoggedIn, async (req, res, next) => {
   try {
       const post = await Post.findOne({ where: { id: req.params.id }});

       console.log(post);
       // user 모델과 post 모델간 N:M 관계 모델에 설정
       // add 메서드로 post모델의 as인 Post를 넣어서 through로 생성된 likepost에 컬럼 등록
       // postId는 왜래키로 넘기기 때문에 post.addPost를 사용할 경우 userId가 파라미터가 됨
       await post.addLiker(parseInt(req.user.id, 10));
 //      console.log(like);
      // const like = await user.addLikepost(parseInt(req.params.id, 10));

       /*if (user) {
           await user.addPost(parseInt(req.params.id, 10));
           res.send('success');
       } else {
           res.status(404).send('no post');
       }*/
   } catch(error) {
       console.error(error);
       next(error);
   }
});

// 포스트 삭제
router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        await Post.destroy({ where: { id: req.params.id }});
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
})

module.exports = router;