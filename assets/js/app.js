var app = angular.module('myApp', ['ngRoute','ngResource','ngAnimate','ngSanitize', 'ui.bootstrap']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
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

app.controller('appController', function($scope, $location, $anchorScroll, getSourceData, newSourceFactory) {
    var defaultSource = "associated-press", selectedIndex;
    $scope.message = "Read all about it";
    $scope.submessage = "Powered by News API";
    $scope.errorMessages = {image: 'images/evo.png',
                            author: 'Author Not Provided',
                            publish_date: 'Publish Date Not Provided',
                            title: 'Title Not Provided',
                            description: 'Description Not Provided'};
    $scope.source = {};
    $scope.$on('$routeChangeSuccess', function() {
      $scope.pageId = $location.path().replace("/", "");
      if (!$scope.pageId) $scope.pageId = '1';
    });
    newSourceFactory.get().then(function (msg) {
        for (var i = 0, len = msg.data.sources.length; i < len; i++) {

          if (msg.data.sources[i].id == defaultSource) {
            $scope.source.description = msg.data.sources[i].description;
            $scope.source.url = msg.data.sources[i].url;
            $scope.source.name = msg.data.sources[i].name;
            $scope.source.category = msg.data.sources[i].category;
            selectedIndex = i;
            break;
          }
        }
        $scope.news = msg.data;
    });

    $scope.goToNextSource = function() {
        if (selectedIndex == $scope.news.sources.length - 1) {
          selectedIndex = 0;
        } else {
          selectedIndex++;
        }
        setSource(selectedIndex);
    };

    $scope.goToPrevSource = function() {
        if (selectedIndex == 0) {
          selectedIndex = $scope.news.sources.length - 1;
        } else {
          selectedIndex--;
        }
        setSource(selectedIndex);
    };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    $scope.goRandom = function() {
        var newSelectedIndex = $scope.selectedIndex;
        // make sure the random number is not the same as the last random number
        while (newSelectedIndex == $scope.selectedIndex) {
          newSelectedIndex = getRandomInt(0, $scope.news.sources.length - 1);
        }
        selectedIndex = newSelectedIndex;
        console.log('selectedindex', selectedIndex);
        setSource(selectedIndex);

    };

    setSource = function(selectedIndex) {
        $scope.source.description = $scope.news.sources[selectedIndex].description;
        $scope.source.url = $scope.news.sources[selectedIndex].url;
        $scope.source.name = $scope.news.sources[selectedIndex].name;
        $scope.source.category = $scope.news.sources[selectedIndex].category;
        $scope.goAPI($scope.news.sources[selectedIndex].id);
        $("#news").goTo(); 
    };
    var hideKeyboard = function() {

      document.activeElement.blur();
      var inputs = document.querySelectorAll('input');
      for(var i = 0; i < inputs.length; i++) {
        inputs[i].blur();
      }
      //$('#defocus').focus();
    };
    $scope.closeKeyboard = function(event){
    if(event.keyCode == 13)
         hideKeyboard();
    };
    $scope.sourceSelected = function() {
      for (var i = 0, len = $scope.news.sources.length; i < len; i++) {
            if (this.selected == $scope.news.sources[i].id) {
              $scope.source.description = $scope.news.sources[i].description;
              $scope.source.url = $scope.news.sources[i].url;
              $scope.source.name = $scope.news.sources[i].name;
              $scope.source.category = $scope.news.sources[i].category;
              selectedIndex = i;
              break;
            }
        }
      $scope.goAPI(this.selected);
      this.selected = "";
      $("#news").goTo();
      hideKeyboard();
      
    };

    $scope.goAPI = function(thisSource) {
        getSourceData.get(thisSource).then(function (msg) {
          console.log(msg)
            $scope.thisData = msg.data.articles;
        });      
    };
    $scope.goAPI(defaultSource);
 });

app.factory('getSourceData', function($http) {
    return {
      get: function (thisSource) {
          var thisURL = encodeURI("https://newsapi.org/v1/articles?source=" + thisSource + "&apiKey=fd3dd1dc190444ebbfce01a08c3c3760");
          return $http.get(thisURL);
      }
    };
});

app.factory('newSourceFactory', function ($http) {
    return {
      get: function () {
          return $http.get('https://newsapi.org/v1/sources?language=en');
      }
    };

});

app.directive('animateOnChange', function($timeout) {
    return function(scope, element, attr) {
        scope.$watch(attr.animateOnChange, function(nv,ov) {
            if (nv!=ov) {
                element.addClass('changed');
                $timeout(function() {
                    element.removeClass('changed');
                }, 250);
            }
        });
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
