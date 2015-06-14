var wixapi = require('./wixapi.js');
var dotenv = require('dotenv').load();

var wix = wixapi.getAPI(WIX_SECRET, WIX_APP_ID, WIX_INSTANCE_ID);
var contactSchema = require('./schemas/contactupdate.js');
var contactForm = require('./schemas/contactform.js');


var activity = wix.Activities.newActivity(wixapi.ACTIVITY_TYPES.CONTACT_FORM);
activity.contactUpdate.addEmail("main", "davidz@wix.com").withName("David", "Zuckerman");
activity.withLocationUrl("test.com").withActivityDetails("This is a test activity post", "http://www.test.com");
activity.activityInfo.addField("name", "David Zuckerman").addField("email", "davidz@wix.com");

wix.Activities.getTypes().then(function(data) {
    console.log(data);
}, function(error) {
    console.log(error);
});

wix.Activities.postActivity(activity,
    "USER SESSION")
    .then(function(data) {
        console.log(data);
    }, function(error) {
        console.log(error);
    });

wix.Insights.getActivitiesSummary().then(function(data) {
    console.log(data);
}, function(error) {
    console.log(error);
});
