/*jshint node:true*/
'use strict';

var express = require('express');
var mongoose = require('mongoose');
var Post = require('../models/post');
var comments = require('./comments');

var router = express.Router();

router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function(err, post) {
    if (err) return next(err);
    if (!post) return next(new Error("post not found"));

    req.post = post;
    return next();
  });
});

// For comment routes, move to comment router after adding post property to request
router.use('/:post/comments', comments);

router.route('/')
  .get(function(req, res, next) {
    Post.find(function(err, posts) {
      if (err) return next(err);
      res.json(posts);
    });
  })
  .post(function(req, res, next) {
    var post = new Post(req.body);

    post.save(function(err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });

router.route('/:post')
  .get(function(req, res) {
    req.post.populate('comments', function(err, post) {
      res.json(post);
    });
  });

router.put('/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
