	var app = angular.module("myapp", ["ngRoute"]);

	app.config(function($routeProvider) {
	  $routeProvider.when("/main", {
		templateUrl: 'main.html',
		controller: 'mainController',
		resolve: {
		  'check': function($rootScope, $location) {
			if (!$rootScope.logged) {
			  $location.path("/");
			}
		  }
		}
	  });
	  $routeProvider.when("/", {
		templateUrl: 'login.html',
		controller: 'loginController',

	  });
	});

	app.controller("loginController", function($scope, $location, $rootScope, $http) {
		$scope.login = function() {
			var uname = $scope.username;
			var pword = $scope.password;
			$http.post("/login", { username: uname, password: pword })
				.then(function(response) {
					$rootScope.logged = true;
					$rootScope.message = "Login successful!";
					$location.path("/main"); 
				})
				.catch(function(error) {
					$rootScope.logged = false;
					$rootScope.message = "Invalid username or password";
					console.error("Login failed:", error);
				});
		};
	});


	app.controller("mainController", function($scope, $http, $rootScope, $location) {
	  $scope.pagesizes = [5, 10, 15, 20];
	  $scope.pageSize = 5;
	  $scope.currentPage = 0;
	  $scope.sortBy = ''; // Default sorting by no column
	  $scope.sortAsc = true; // Default ascending

	  $scope.logout = function() {
		$rootScope.logged = false;
		$location.path("/");
		$rootScope.message = "Logged Out";
	  }

	  $scope.courses = [{
		  'courseid': 'bsit',
		  'coursename': 'information technology'
		},
		{
		  'courseid': 'bscs',
		  'coursename': 'computer science'
		},
		{
		  'courseid': 'bsis',
		  'coursename': 'information systems'
		},
		{
		  'courseid': 'bsim',
		  'coursename': 'information management'
		},
		{
		  'courseid': 'act',
		  'coursename': 'computer technology'
		},
	  ];

	  $scope.levels = [{
		  'levelid': '1',
		  'levelname': '1st year'
		},
		{
		  'levelid': '2',
		  'levelname': '2nd year'
		},
		{
		  'levelid': '3',
		  'levelname': '3rd year'
		},
		{
		  'levelid': '4',
		  'levelname': '4th year'
		},
	  ];

	  $http({
		'url': '/studentlist',
		'method': 'get'
	  }).then(function(response) {
		$scope.slist = response.data;
		$scope.header = Object.keys($scope.slist[0]);
	  });

	  $scope.numberOfPages = function() {
		return Math.ceil($scope.slist.length / $scope.pageSize);
	  }

	  $scope.modalcontrol = function(modalname, control) {
		document.getElementById(modalname).style.display = control;
	  }

	  $scope.savestudent = function() {
		$http({
		  'url': '/savestudent',
		  'method': 'post',
		  'data': {
			'idno': $scope.idno,
			'lastname': $scope.lastname,
			'firstname': $scope.firstname,
			'course': $scope.course,
			'level': $scope.level,
		  }
		}).then(function(response) {
		  $scope.message = response.data;
		  modalcontrol('studentmodal', 'none');
		});
	  }

	  $scope.sortStudents = function(column) {
		if ($scope.sortBy === column) {
		  $scope.sortAsc = !$scope.sortAsc;
		} else {
		  $scope.sortBy = column;
		  $scope.sortAsc = true;
		}

		$scope.slist.sort(function(a, b) {
		  var fieldA = a[$scope.sortBy];
		  var fieldB = b[$scope.sortBy];
		  var comparison = 0;

		  if (typeof fieldA === 'string' && typeof fieldB === 'string') {
			fieldA = fieldA.toUpperCase();
			fieldB = fieldB.toUpperCase();
		  }

		  if (fieldA > fieldB) {
			comparison = 1;
		  } else if (fieldA < fieldB) {
			comparison = -1;
		  }
		  return $scope.sortAsc ? comparison : -comparison;
		});
	  };

	  $scope.pageButtons = function() {
		var buttons = [];
		var totalPages = $scope.numberOfPages();

		if (totalPages <= 7) {
		  for (var i = 0; i < totalPages; i++) {
			buttons.push(i + 1);
		  }
		} else {
		  var start = Math.max(1, $scope.currentPage - 2);
		  var end = Math.min(totalPages, $scope.currentPage + 2);

		  if ($scope.currentPage < 4) {
			end = 5;
		  } else if ($scope.currentPage > totalPages - 3) {
			start = totalPages - 4;
		  }

		  for (var i = start; i <= end; i++) {
			buttons.push(i);
		  }
		}

		return buttons;
	  };

	  $scope.changePage = function(page) {
		$scope.currentPage = page - 1;
	  };
	});

	app.filter("startFrom", function() {
	  return function(input, start) {
		start = +start;
		return input.slice(start);
	  };
	});