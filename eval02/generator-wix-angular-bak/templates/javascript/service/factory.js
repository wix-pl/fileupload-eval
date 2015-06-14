'use strict';

(function () {

  /* @ngInject */
  function <%= cameledName %>Factory() {
    function <%= classedName %>() {
      var meaningOfLife = 42;

      this.someMethod = function () {
        return meaningOfLife;
      };
    }

    return <%= classedName %>;
  }

  angular
    .module('<%= scriptAppName %>Internal')
    .factory('<%= classedName %>', <%= cameledName %>Factory);

})();
