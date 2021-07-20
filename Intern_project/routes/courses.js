const express = require('express');
const router = express.Router();
const { Course } = require('../models/course');
const { Teacher } = require('../models/teacher');

// Add Route
router.get('/add', ensureAuthenticated, async (req, res) => {
  res.render('add_course', {
    title: 'Add Course Details'
  });
});

// Add Submit POST Route
router.post('/add', async (req, res) => {
  try {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
      res.render('add_course.hbs', {
        title: 'Add Course',
        errors: errors
      });
    } else {
      let course = await Course.create({
        title: req.body.title,
        name: req.body.name,
        fees: req.body.number,
      });
      article.save();
      req.flash('success', 'Course Added');
      res.redirect('/');
    }
  } catch (e) {
    res.send(e);
  }

});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course._id != req.user._id) {
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('update_course.hbs', {
      title: 'Edit Course',
      article: course
    });

  } catch (e) {
    res.send(e);
  }

});

// Update Submit POST Route
router.post('/edit/:id', async (req, res) => {
  try {
    const course = {
      title: req.body.title,
      course: req.body.name,
      fees: req.body.number
    };

    let query = { _id: req.params.id }

    const update = await Course.update(query, article);
    if (update) {
      req.flash('success', 'Course Updated');
      res.redirect('/');
    } return;

  } catch (e) {
    res.send(e);
  }

});

// Delete Article
router.delete('/:id', async (req, res) => {

  try {
    if (!req.user._id) {
      res.status(500).send();
    }
    let query = { _id: req.params.id }
    const course = await Course.findById(req.params.id);

    if (course._id != req.user._id) {
      res.status(500).send();
    } else {
      remove = await Course.findByIdAndRemove(query);
      if (remove) {
        res.send('Success');
      }
    };
  } catch (e) {
    res.send(e);
  }

});



// Get Single Article
router.get('/:id', async (req, res) => {

  const course = await Article.findById(req.params.id);
  const user = await User.findById(article.author);
  if (user) {
    res.render('article', {
      article: article,
      author: user.name
    });
  }
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;