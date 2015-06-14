'use strict';

module.exports = {
  '${debug}': 'true',
  '${enableMocks}': 'false',
  '${experiments}': '{}',
  '${locale}': 'en',<% if (dashboardApp) { %>
  '${metaSiteId}': 'c853c829-503e-48b1-892f-28d8c22a887c',<% } %>

  '${staticBaseUrl}': '//static.parastorage.com/',
  '${staticsUrl}': '//localhost:9000/',<% if (dashboardApp) { %>

  '#parse(\'views/my-account/embeds_head.vm\')': '',
  '#parse(\'views/my-account/embeds_body_top.vm\')': '',
  '#parse(\'views/my-account/embeds_body_bottom.vm\')': ''<% } else { %>
  '${newRelicEndUserHeader}': '',
  '${newRelicEndUserFooter}': ''<% } %>
};
