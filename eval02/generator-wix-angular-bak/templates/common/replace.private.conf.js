'use strict';

module.exports = {
  '${enableMocks}': 'true',<% if (dashboardApp) { %>
  '${metaSiteId}': 'c853c829-503e-48b1-892f-28d8c22a887c',<% } %>
  '${experiments}': '{}'
};
