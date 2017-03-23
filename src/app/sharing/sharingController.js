﻿angular
    .module('bit.sharing')

    .controller('sharingController', function ($scope, apiService, cipherService, $analytics, $q) {
        $scope.logins = [];
        $scope.subvaults = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var subvaultPromise = apiService.subvaults.listMe({}, function (subvaults) {
                var decSubvaults = [];

                for (var i = 0; i < subvaults.Data.length; i++) {
                    var decSubvault = cipherService.decryptSubvault(subvaults.Data[i], null, true);
                    decSubvaults.push(decSubvault);
                }

                $scope.subvaults = decSubvaults;
            }).$promise;

            var cipherPromise = apiService.ciphers.listSubvaults({}, function (ciphers) {
                var decLogins = [];

                for (var i = 0; i < ciphers.Data.length; i++) {
                    if (ciphers.Data[i].Type === 1) {
                        var decLogin = cipherService.decryptLoginPreview(ciphers.Data[i]);
                        decLogins.push(decLogin);
                    }
                }

                $scope.logins = decLogins;
            }).$promise;

            $q.all([subvaultPromise, cipherPromise]).then(function () {
                $scope.loading = false;
            });
        });

        $scope.filterBySubvault = function (subvault) {
            return function (cipher) {
                return cipher.subvaultIds.indexOf(subvault.id) > -1;
            };
        };
    });
