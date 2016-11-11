var app = angular.module('myApp', ['ngRoute','ngResource','ngAnimate','ngSanitize', 'ui.bootstrap']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  // $locationProvider.html5Mode(true);
  $routeProvider
   .when('/', {
    templateUrl: 'main.html',

    // resolve: {
    //   // I will cause a 1 second delay
    //   delay: function($q, $timeout) {
    //     var delay = $q.defer();
    //     $timeout(delay.resolve, 1000);
    //     return delay.promise;
    //   }
    // }
  })
  .when('/2', {
    templateUrl: 'left-sidebar.html',

  })
  .when('/3', {
  	templateUrl: 'right-sidebar.html',

  })
  .when('/4', {
  	templateUrl: 'no-sidebar.html',

  })
  .otherwise({
  	redirectTo: '/'
  });
}]);

app.controller('appController', function($scope, $route, $http, $routeParams, $location, newSourceFactory) {
     $scope.images = [];
     $scope.$route = $route;
     $scope.$location = $location;
     $scope.$routeParams = $routeParams;
     $scope.message = "Read all about it";
     $scope.submessage = "Powered by News API";
     defaultSource = "bbc-news";
     $scope.source = defaultSource;

     newSourceFactory.get().then(function (msg) {
        for (var i = 0, len = msg.data.sources.length; i < len; i++) {

          if (msg.data.sources[i].id == defaultSource) {
            $scope.sourceDescription = msg.data.sources[i].description;
            break;
          }
        }
        console.log(i);
        $scope.news = msg.data;
        console.log($scope.news);
      });;



     $scope.sourceSelected = function() {
       console.log(this);
       $scope.source = this.selected;

       for (var i = 0, len = $scope.news.sources.length; i < len; i++) {
            if ($scope.news.sources[i].id == this.selected) {
              $scope.sourceDescription = $scope.news.sources[i].description;
              break;
            }
        }
       $scope.displaySource = $scope.defaultSource;
       console.log(this.selected);
       $scope.goAPI(this.selected);
       this.selected = "";


     };
     $scope.goAPI = function(thisSource) {


     var thisURL = encodeURI("https://newsapi.org/v1/articles?source=" + thisSource + "&apiKey=fd3dd1dc190444ebbfce01a08c3c3760");
        // console.log(thisURL);
        $scope.newData = $http.get(thisURL)
          .success(function(newData) {

            thisLength = newData.articles.length;
            // console.log(thisLength);
            $scope.thisData = newData.articles;
            // console.log($scope.thisData);


            //$scope.data.push(newData);
          })
          .error(function (error, status){
            $scope.data.error = { message: error, status: status};
            console.log($scope.data.error.status);
          });
      };

      $scope.goAPI(defaultSource);

     $scope.pageClass = 'page-home';
 });

app.factory('newSourceFactory', function ($http) {
        return {
          get: function () {

              return $http.get('https://newsapi.org/v1/sources?language=en');
          }
      };

});


app.directive('typeaheadFocus', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModel) {

      //trigger the popup on 'click' because 'focus'
      //is also triggered after the item selection
      element.bind('click', function () {

        var viewValue = ngModel.$viewValue;

        //restore to null value so that the typeahead can detect a change
        if (ngModel.$viewValue == ' ') {
          ngModel.$setViewValue(null);
        }

        //force trigger the popup
        ngModel.$setViewValue(' ');

        //set the actual value in case there was already a value in the input
        ngModel.$setViewValue(viewValue || ' ');
      });

      //compare function that treats the empty space as a match
      scope.emptyOrMatch = function (actual, expected) {
        if (expected == ' ') {
          return true;
        }
        return actual.indexOf(expected) > -1;
      };
    }
  };
});
app.filter('date', function($filter)
{
    return function(input)
    {
        if(input === null){ return ""; }
        var _date = $filter('date')(new Date(input), 'dd/MM/yyyy');
        return _date.toUpperCase();
    };
});
