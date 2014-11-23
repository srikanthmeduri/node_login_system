'use strict';

angular.module('users')
    .factory('Global', function() {
        var _this = this;

        console.log(_this);

        _this._data = {
            user: window.user,
            authenticated: false,
            isAdmin: false
        };
        if (window.user && window.user.roles) {
            _this._data.authenticated = window.user.roles.length;
            _this._data.isAdmin = window.user.roles.indexOf('admin') !== -1;
        }
        return _this._data;
    });
