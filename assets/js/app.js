var app = angular.module('myApp', ['ngRoute','ngResource','ngAnimate','ngSanitize', 'ui.bootstrap']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
   .when('/', {
    templateUrl: 'main.html',
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

app.factory('newsFactory', function($http) {
    var apiKey = "fd3dd1dc190444ebbfce01a08c3c3760";
    return {
      getSources: function () {
        return $http.get('https://newsapi.org/v2/sources?language=en&apiKey=' + apiKey);
      },
      getNews: function (thisSource) {
        var thisUrl = encodeURI("https://newsapi.org/v2/top-headlines?sources=" + thisSource + "&apiKey=" + apiKey);
        return $http.get(thisUrl);
      },
      getNewsByKeyword: function(searchString) {
        var thisUrl = encodeURI("https://newsapi.org/v2/everything?q=" + searchString + "&apiKey=" + apiKey);
        return $http.get(thisUrl);
      }
    };
});

app.controller('appController', function($scope, $location, $anchorScroll, newsFactory) {
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

    var doInit = function() {
      getSources();
      getNews(defaultSource);
    };

    var getSources = function() {
      newsFactory.getSources().then(function (msg) {
        for (var i = 0, len = msg.data.sources.length; i < len; i++) {
          if (msg.data.sources[i].id == defaultSource) {
            $scope.source = msg.data.sources[i];
            selectedIndex = i;
            break;
          }
        }
        $scope.news = msg.data;
      }).catch(function(e) {
        console.log('error getting news sources', e);
      });
    };
    

    var getNews = function(source) {
      newsFactory.getNews(source).then(function (msg) {
          console.log(msg);
          $scope.thisData = msg.data.articles;
      });      
    };

    $scope.getNewsByWord = function(searchString) {
      newsFactory.getNewsByKeyword(searchString).then(function (msg) {
        $scope.thisData = msg.data.articles;
        $scope.source.name = "Internet";
        $scope.source.description = "Searched the web for '" + searchString + "'.  Happy reading!";
        $("#news").goTo(); 
        console.log('got news by word: ' + searchString, msg);
      }).catch(function(e) {
        console.log('error getting news by keyword: ' + searchString, e);
      });
    };

    $scope.searchStringChanged = function(e) {
      if (e.keyCode == 13) {
        $scope.getNewsByWord($scope.searchString);
      }
    }

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
        //console.log('selectedindex', selectedIndex);
        setSource(selectedIndex);

    };

    setSource = function(selectedIndex) {
        $scope.source.description = $scope.news.sources[selectedIndex].description;
        $scope.source.url = $scope.news.sources[selectedIndex].url;
        $scope.source.name = $scope.news.sources[selectedIndex].name;
        $scope.source.category = $scope.news.sources[selectedIndex].category;
        getNews($scope.news.sources[selectedIndex].id);
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
              $scope.source = $scope.news.sources[i];
              selectedIndex = i;
              break;
            }
        }
      getNews(this.selected);
      this.selected = "";
      $("#news").goTo();
      hideKeyboard();
      
    };

    doInit();
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
