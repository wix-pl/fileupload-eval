/**
 * GET /settings
 * Home page.
 */
exports.getApp = function(req, res) {
  res.render('app', {
    title: 'App'
  });
};
