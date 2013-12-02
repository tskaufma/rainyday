'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
   .controller('ListCtrl', ['$scope', 'FBURL', 'Firebase', 'angularFireCollection', function($scope, FBURL, Firebase, angularFireCollection) {
       if (!$scope.auth) return;
       
       var newList = {
           name: null,
           shared: false
       };
       $scope.list = angular.copy(newList);
       
       var ref = new Firebase(FBURL+'/lists/' + $scope.auth.id);
       $scope.lists = angularFireCollection(ref);
       
       $scope.addList = function() {
           if ($scope.list.name) {
               $scope.lists.add($scope.list);
               $scope.list = angular.copy(newList);
           }
       };
   }])
   
   .controller('ListItemCtrl', ['$scope', '$routeParams', 'FBURL', 'Firebase', 'angularFireCollection', function($scope, $routeParams, FBURL, Firebase, angularFireCollection) {
       $scope.item = {
           title: null,
           when: null,
           desc: null
       };
       
       var path = "/"
       if ($routeParams.listId) {
           path += $routeParams.listId;
       }
       var ref = new Firebase(FBURL+'/listItems' + path);
       $scope.items = angularFireCollection(ref);
       
       $scope.addItem= function() {
           if ($scope.item.title) {
               $scope.items.add($scope.item);
               $scope.item = null;
           }
       }; 
   }])

   .controller('LoginCtrl', ['$scope', '$location', 'loginService', function($scope, $location, loginService) {
      
      if ($scope.auth) {
        $location.path("/lists");
        return;
      }
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.login = function(callback) {
         $scope.err = null;
         loginService.login($scope.email, $scope.pass, '/lists', function(err, user) {
            $scope.err = err||null;
            typeof(callback) === 'function' && callback(err, user);
         });
      };

      $scope.loginFacebook = function(callback) {
         $scope.err = null;
         loginService.loginFacebook('/lists', function(err, user) {
            $scope.err = err||null;
            typeof(callback) === 'function' && callback(err, user);
            loginService.createProfile(user.id, user.displayName);
         });
      };

      $scope.createAccount = function() {
         if( !$scope.email ) {
            $scope.err = 'Please enter an email address';
         }
         else if( !$scope.pass ) {
            $scope.err = 'Please enter a password';
         }
         else if( $scope.pass !== $scope.confirm ) {
            $scope.err = 'Passwords do not match';
         }
         else {
            loginService.createAccount($scope.email, $scope.pass, function(err, user) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  // must be logged in before I can write to my profile
                  $scope.login(function(err) {
                     if( !err ) {
                        loginService.createProfile(user.id, user.email);
                     }
                  });
               }
            });
         }
      };
   }])

   .controller('AccountCtrl', ['$scope', 'loginService', 'angularFire', 'FBURL', '$timeout', function($scope, loginService, angularFire, FBURL, $timeout) {

      angularFire(FBURL+'/users/'+$scope.auth.id, $scope, 'user', {});

      $scope.logout = function() {
         loginService.logout('/login');
      };

      $scope.oldpass = null;
      $scope.newpass = null;
      $scope.confirm = null;

      function reset() {
         $scope.err = null;
         $scope.msg = null;
      }

      $scope.updatePassword = function() {
         reset();
         loginService.changePassword(buildPwdParms());
      };

      $scope.$watch('oldpass', reset);
      $scope.$watch('newpass', reset);
      $scope.$watch('confirm', reset);

      function buildPwdParms() {
         return {
            email: $scope.auth.email,
            oldpass: $scope.oldpass,
            newpass: $scope.newpass,
            confirm: $scope.confirm,
            callback: function(err) {
               if( err ) {
                  $scope.err = err;
               }
               else {
                  $scope.msg = 'Password updated!';
               }
            }
         }
      }

   }]);