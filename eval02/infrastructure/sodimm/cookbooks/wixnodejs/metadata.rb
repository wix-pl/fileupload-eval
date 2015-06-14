maintainer       "Wixproducts Admin"
maintainer_email "admin@wixproducts.com"
license          "Apache 2.0"
description      "Installs/Configures wixproducts"
long_description IO.read(File.join(File.dirname(__FILE__), 'README.md'))
version          "1.0.0"
depends "apt"

%w{ debian ubuntu centos redhat }.each do |os|
    supports os
end
