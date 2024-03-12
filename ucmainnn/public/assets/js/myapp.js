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
  $scope.sortBy = ''; 
  $scope.sortAsc = true; 

  $scope.logout = function() {
    $rootScope.logged = false;
    $location.path("/");
    $rootScope.message = "Logged Out";
  }

  $scope.courses = [
    { 'courseid': 'bsit', 'coursename': 'information technology' },
    { 'courseid': 'bscs', 'coursename': 'computer science' },
    { 'courseid': 'bsis', 'coursename': 'information systems' },
    { 'courseid': 'bsim', 'coursename': 'information management' },
    { 'courseid': 'act', 'coursename': 'computer technology' },
  ];

  $scope.levels = [
    { 'levelid': '1', 'levelname': '1st year' },
    { 'levelid': '2', 'levelname': '2nd year' },
    { 'levelid': '3', 'levelname': '3rd year' },
    { 'levelid': '4', 'levelname': '4th year' },
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
      console.log(response.data); 
      $scope.idno = '';
      $scope.lastname = '';
      $scope.firstname = '';
      $scope.course = '';
      $scope.level = '';
      $scope.modalcontrol('studentmodal', 'none');
      $http({
        'url': '/studentlist',
        'method': 'get'
      }).then(function(response) {
        $scope.slist = response.data;
        $scope.totalEntries = $scope.slist.length;
        $scope.currentPage = Math.min($scope.currentPage, $scope.numberOfPages() - 1);
      }).catch(function(error) {
        console.error("Error fetching updated student list:", error);
      });
    }).catch(function(error) {
      console.error("Error saving student:", error);
    });
  }
  
  $scope.editStudent = function(student) {
    $scope.idno = student.idno || '';
    $scope.lastname = student.lastname;
    $scope.firstname = student.firstname;
    $scope.course = student.course;
    $scope.level = student.level;

    $scope.modalcontrol('studentmodal', 'block');
  };

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

    if (totalPages <= 10) {
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

  $scope.deleteStudent = function(idno, index) {
    if (confirm("Are you sure you want to delete student with IDNO: " + idno + "?")) {
      $http.get("/deletestudent?idno=" + idno)
        .then(function(response) {
          var studentIndex = $scope.slist.findIndex(function(student) {
            return student.idno === idno;
          });

          if (studentIndex !== -1) {
            $scope.slist.splice(studentIndex, 1);
            console.log("Student with IDNO: " + idno + " is deleted.");
          } else {
            console.error("Student with IDNO: " + idno + " not found.");
          }
        })
        .catch(function(error) {
          console.error("Error deleting student:", error);
        });
    }
  };

  $scope.logoutConfirmation = function() {
    if (confirm("Are you sure you want to log out?")) {
      $scope.logout();
    }
  };
});

app.filter("startFrom", function() {
  return function(input, start) {
    start = +start;
    return input.slice(start);
  };
});
