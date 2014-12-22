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
        controller: 'PostsCtrl'
      });

    $urlRouterProvider.otherwise('/');
  }
]);

flapperNews.factory('posts', [
  '$http',
  function($http) {
    var o = {
      posts: [];
    };

    o.getAll = function() {
      return $http.get('/posts').success(function(data) {
        angular.copy(data, o.posts);
      });
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

      $scope.posts.push({
        title: $scope.title,
        link: $scope.link,
        upvotes: 0,
        comments: []
      });

      $scope.title = '';
      $scope.link = '';
    };

    $scope.incrementUpvotes = function(post) {
      post.upvotes++;
    };
  }
]);

flapperNews.controller('PostsCtrl', [
  '$scope',
  '$stateParams',
  'posts',
  function($scope, $stateParams, posts) {
    $scope.post = posts.posts[$stateParams.id];

    $scope.addComment = function() {
      if ($scope.body === '') return;
      $scope.post.comments.push({
        body: $scope.body,
        author: 'user',
        upvotes: 0
      });
      $scope.body = '';
    };

    $scope.incrementUpvotes = function(comment) {
      comment.upvotes++;
    };
  }
]);
