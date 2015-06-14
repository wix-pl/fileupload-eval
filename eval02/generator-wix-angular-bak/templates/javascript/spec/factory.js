'use strict';

describe('Factory: <%= classedName %>', function () {

  // load the factory's module
  beforeEach(function () {
    module('<%= scriptAppName %>Internal');
  });

  // instantiate factory
  var <%= cameledName %>;
  beforeEach(inject(function (<%= classedName %>) {
    <%= cameledName %> = new <%= classedName %>();
  }));

  it('should do something', function () {
    expect(<%= cameledName %>.someMethod()).toBe(42);
  });

});
