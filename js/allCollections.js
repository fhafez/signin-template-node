"use strict";

var SigninDetailedCollection = Backbone.Collection.extend({
    url: 'php/signinJS.php/details/',
    model: SigninDetailedModel,
    storeName: 'signinDetails',
    defaults: {
    },
    
    validate: function() {
        
        if (!attrs.id || !attrs.service_name || !attrs.provider_name) {
            return "A DB issue occurred retrieving services, please contact Administrator";
        }
    }
    
});

var ServicesCollection = Backbone.Collection.extend({
    url: function() {
        return true;
    },
    sync: function() {
        return null;
    },
    model: ServicesModel
})

var TodaysAppointmentsCollection = Backbone.Collection.extend({
    model: SigninModel,
    storeName: 'todaysAppts',
    url: 'https://' + project_url + '/listAppointments/',
});

var MatchingPatients = Backbone.Collection.extend({
    model: PatientModel,
    wait: true,
    url: 'https://' + project_url + '/getPatients/',
    storeName: 'allPatients',
    initialize: function(models, options) {
        //console.log(options);
        
        if (options) {
            this.firstname = options.firstname;
            this.lastname = options.lastname;
            this.dob = options.dob;
        }
    },
    where: function(attrs, first, options){
        options = options || {};

        if (_.isEmpty(attrs)) return first ? void 0 : [];

        return this[first ? 'find' : 'filter'](function(model) {
            for (var key in attrs) {
                if (options.caseInsensitive) {
                    if (attrs[key].toLowerCase() !== model.get(key).toLowerCase()) return false;
                } else {
                    if (attrs[key] !== model.get(key)) return false;
                }
            }
            return true;
        });
    }
});

