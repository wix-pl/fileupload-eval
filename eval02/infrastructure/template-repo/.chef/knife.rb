# See https://docs.chef.io/config_rb_knife.html for more information on knife configuration options

current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                "wixproducts"
client_key               "#{current_dir}/wixproducts.pem"
validation_client_name   "wixproducts-validator"
validation_key           "#{current_dir}/wixproducts-validator.pem"
chef_server_url          "https://api.opscode.com/organizations/wixproducts"
syntax_check_cache_path  "#{ENV['HOME']}/.chef/syntaxcache"
cookbook_path            ["#{current_dir}/cookbooks"]
