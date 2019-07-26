const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {ensureAuthenticated} = require('../helpers/authenticate');

// Load Post Model
require('../models/Post');
const Post = mongoose.model('posts');

// Post Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Post.find({ user: req.user.id })
    .sort({ date: 'desc' })
    .then(posts => {
      res.render('posts/index', {
        posts: posts
      });
    });
});

// Feed Page
router.get('/feed', ensureAuthenticated, (req, res) => {
  Post.find({})
    .sort({ date: 'desc' })
    .then(posts => {
      res.render('posts/feed', {
        posts: posts
      });
    });
});

// Add Post Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('posts/add');
});

// Edit Post Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Post.findOne({
    _id: req.params.id
  })
    .then(post => {
      res.render('posts/edit', {
        post: post
      });
    });
});

// Multer Middleware
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage
}).single('image');

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
  upload(req, res, (err) => {

    let errors = [];

    if (!req.body.title) {
      errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
      errors.push({ text: 'Please add some details' });
    }

    if (errors.length > 0) {
      res.render('/add', {
        errors: errors,
        title: req.body.title,
        details: req.body.details
      });
    } else {
      console.log(req.file);
      const newUser = {
        username: req.user.name,
        user: req.user.id,
        image: req.file.filename,
        title: req.body.title,
        details: req.body.details
      }
      new Post(newUser)
        .save()
        .then(post => {
          req.flash('success_msg', 'Post added');
          res.redirect('/posts');
        })
    }
  });
});

// Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
  Post.findOne({
    _id: req.params.id
  })
    .then(post => {
      // new values
      post.title = req.body.title;
      post.details = req.body.details;

      post.save()
        .then(post => {
          req.flash('success_msg', 'Post updated');
          res.redirect('/posts');
        })
    });
});

// Delete Post
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Post.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Post removed');
      res.redirect('/posts');
    });
});

module.exports = router;