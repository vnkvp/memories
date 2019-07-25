const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Load Idea Model
require('../models/Idea');
const Idea = mongoose.model('ideas');

// Idea Index Page
router.get('/', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', {
        ideas: ideas
      });
    });
});

// Add Idea Form
router.get('/add', (req, res) => {
  res.render('ideas/add');
});

// Edit Idea Form
router.get('/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      res.render('ideas/edit', {
        idea: idea
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
router.post('/', (req, res) => {
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
        image: req.file.filename,
        title: req.body.title,
        details: req.body.details
      }
      new Idea(newUser)
        .save()
        .then(idea => {
          req.flash('success_msg', 'Video idea added');
          res.redirect('/ideas');
        })
    }
  });
});

// Edit Form process
router.put('/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
    .then(idea => {
      // new values
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video idea updated');
          res.redirect('/ideas');
        })
    });
});

// Delete Idea
router.delete('/:id', (req, res) => {
  Idea.remove({ _id: req.params.id })
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});

module.exports = router;