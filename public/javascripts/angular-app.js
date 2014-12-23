/*global angular*/

var flapperNews = angular.module('flapperNews', ['ui.router']);

flapperNews.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home.html',
        controller: 'MainCtrl',
        resolve: {
          postPromise: ['posts', function(posts) {
            return posts.getAll();
          }]
        }
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: 'posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
      });

    $urlRouterProvider.otherwise('/');
  }
]);

flapperNews.factory('posts', [
  '$http',
  function($http) {
    var o = { posts: [] };

    o.getAll = function() {
      var _this = this;
      return $http.get('/posts').success(function(data) {
        angular.copy(data, _this.posts);
      });
    };

    o.create = function(post) {
      var _this = this;
      return $http.post('/posts', post).success(function(data) {
        _this.posts.push(data);
      });
    };

    o.get = function(id) {
      var _this = this;
      return $http.get('/posts/' + id).then(function(res) {
        return res.data;
      });
    };

    o.upvote = function(post) {
      var _this = this;
      return $http.put('/posts/' + post._id + '/upvote')
        .success(function(data) {
          post.upvotes += 1;
        });
    };

    o.addComment = function(postId, comment) {
      return $http.post('/posts/' + postId + '/comments', comment);
    };

    o.upvoteComment = function(postId, commentId) {
      return $http.put('/posts/' + postId + '/comments/' + commentId + '/upvote');
    };

    return o;
  }
]);

flapperNews.controller('MainCtrl', [
  '$scope',
  'posts',
  function($scope, posts) {
    $scope.posts = posts.posts;

    $scope.addPost = function() {
      if (!$scope.title || $scope.title === '') return;

      posts.create({
        title: $scope.title,
        link: $scope.link
      });

      $scope.title = '';
      $scope.link = '';
    };

    $scope.incrementUpvotes = function(post) {
      posts.upvote(post);
    };
  }
]);

flapperNews.controller('PostsCtrl', [
  '$scope',
  'posts',
  'post',
  function($scope, posts, post) {
    $scope.post = post;

    $scope.addComment = function() {
      if ($scope.body === '') return;

      posts.addComment(post._id, {
        body: $scope.body,
        author: 'user'
      }).success(function(comment) {
        $scope.post.comments.push(comment);
      });

      $scope.body = '';
    };

    $scope.incrementUpvotes = function(comment) {
      posts.upvoteComment(post._id, comment._id)
        .success(function(data) {
          comment.upvotes += 1;
        });
    };
  }
]);
