'use strict';

var kwdizrApp = angular.module('kwdizrApp', [
	'ngResource'
]);

kwdizrApp.service('keywordService', function ($http) {
	this.getSuggestions = function (keyword) {
		var result = $http({
			method: 'GET',
			url: 'http://suggestqueries.google.com/complete/search',
			params: {
				'client': 'hp',
				'q': keyword,
				'hl': 'fr',
				'sugexp' : 'enullwlo'
			}
		});
		return result;
	}
});

kwdizrApp.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if (event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});


function MainCtrl($rootScope, $scope, $sce, keywordService) {

	$scope.keywordList = [];
	$scope.progress = 0;
	$scope.broadcaster = [
		["", null],
		[" ", "a"],
		["a", "a"], ["a", "b"],["à", "a"],["à", "b"],["â", "a"],["â", "b"],
		["b", "a"], ["b", "b"],
		["c", "a"],	["c", "b"],
		["d", "a"],	["d", "b"],
		["e", "a"],	["e", "b"],["é", "a"],["é", "b"],["è", "a"],["è", "b"],
		["f", "a"],	["f", "b"],
		["g", "a"],	["g", "b"],
		["h", "a"],	["h", "b"],
		["i", "a"],	["i", "b"],
		["j", "a"],	["j", "b"],
		["k", "a"],	["k", "b"],
		["l", "a"],	["l", "b"],
		["m", "a"],	["m", "b"],
		["n", "a"],	["n", "b"],
		["o", "a"],	["o", "b"],
		["p", "a"],	["p", "b"],
		["q", "a"],	["q", "b"],
		["r", "a"],	["r", "b"],
		["s", "a"],	["s", "b"],
		["t", "a"],	["t", "b"],
		["u", "a"], ["u", "b"],
		["v", "a"], ["v", "b"],
		["w", "a"],	["w", "b"],
		["x", "a"],	["x", "b"],
		["y", "a"],	["y", "b"],
		["z", "a"],	["z", "b"]
	];
	var existingKeyList = [];

	$scope.searchEnter = function (keycode) {
		console.log(keycode);
		if (keycode === 13) {
			$scope.search();
		}
	}

	$scope.search = function () {
		$scope.keywordList = [];
		$scope.progress = 0;
		existingKeyList = [];
		angular.forEach($scope.broadcaster, function (item) {
			var keyword = $scope.keyword;
			var fix = item[0];
			var direction = item[1];
			if (direction == "a") {
				keyword = keyword + fix;
			} else if (direction == "b") {
				keyword = fix + keyword;
			}
			keywordService.getSuggestions(keyword).then(function (response) {
				var list = parseResponse(response);
				angular.forEach(list, function (keyword) {
					if (existingKeyList.indexOf(keyword.key) != -1) {
						return;
					}
					$scope.keywordList.push(keyword);
					existingKeyList.push(keyword.key);
				});
			});
		});
	}

	function parseResponse(response) {
		var data = response.data.replace('window.google.ac.h(', '');
		data = data.substring(0, data.length - 1);
		var result = JSON.parse(data);
		var list = [];
		angular.forEach(result[1], function (item) {
			var key = item[0].replace(/(<([^>]+)>)/ig, '').trim();
			list.push({
				key: key,
				term: $sce.trustAsHtml(item[0])
			});
		});
		return list;
	}
}