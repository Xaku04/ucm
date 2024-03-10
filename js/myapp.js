	//using the es5
			var app = angular.module("myapp",["ngRoute"]);
			app.config(function($routeProvider){
				
				$routeProvider.when("/main",{
					templateUrl:'main.html',
					controller:'mainController',
					resolve:{
						'check':function($rootScope,$location){
							if(!$rootScope.logged){
								$location.path("/");
							}
						}
					}
				});
				$routeProvider.when("/",{
					templateUrl:'login.html',
					controller:'loginController',
					
				});
			});
			///
			app.controller("loginController",function($scope,$location,$rootScope){
				
				$scope.login = function(){
					var uname = $scope.username;
					var pword = $scope.password;
					if(uname=="admin" && pword=="user"){
						$rootScope.logged = true;
						$location.path("/main");
					}
					else{
						$rootScope.message = "Invalid user";
					}
				}
				
				
			});
			///
			app.controller("mainController",function($scope,$http,$rootScope,$location){
				$scope.pagesizes=[5,10,15,20];
				$scope.pageSize=5;
				$scope.currentPage = 0
				
				$scope.logout = function(){
					$rootScope.logged = false;
					$location.path("/");
					$rootScope.message = "Logged Out";
				}
				
				
				$scope.courses= [
					{'courseid':'bsit','coursename':'information technology'},
					{'courseid':'bscs','coursename':'computer science'},
					{'courseid':'bsis','coursename':'information systems'},
					{'courseid':'bsim','coursename':'information management'},
					{'courseid':'act','coursename':'computer technology'},
				];
				
				$scope.levels = [
					{'levelid':'1','levelname':'1st year'},
					{'levelid':'2','levelname':'2nd year'},
					{'levelid':'3','levelname':'3rd year'},
					{'levelid':'4','levelname':'4th year'},
				];
				//create a function to retrieve the data from app.js
					$http({
						'url':'/studentlist',
						'method':'get'
					}).then(function(response){
						$scope.slist = response.data;
						$scope.header = Object.keys($scope.slist[0]);
					});
					
				$scope.numberOfPages = function(){
					return Math.ceil($scope.slist.length/$scope.pageSize);
				}
				
				$scope.modalcontrol = function(modalname,control){
					document.getElementById(modalname).style.display=control;
				}
				
				$scope.savestudent = function(){
					$http({
						'url':'/savestudent',
						'method':'post',
						'data':{
							'idno':$scope.idno,
							'lastname':$scope.lastname,
							'firstname':$scope.firstname,
							'course':$scope.course,
							'level':$scope.level,
						}
					}).then(function(response){
						$scope.message = response.data;
						modalcontrol('studentmodal','none');
					});					
				}
			});
			//
			app.filter("startFrom",function(){
				return function(input,start){
					start =+ start;
				return input.slice(start);
				};
			});
