FlowRouter.route('/profile', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "profile"});
    },
    name: "profile"
});


if(Meteor.isClient){
    
    Template.profile.helpers({
        firstName: function(){ return Meteor.user().profile.firstName },
        lastName:  function(){ return Meteor.user().profile.lastName },
        phone:     function(){ return Meteor.user().profile.phone },
        address:   function(){ return Meteor.user().profile.address }
    })
    
    
    Template.profile.events({
        'submit .form': function(event, template){
            event.preventDefault(); 
            var firstName = template.$("input[name=firstName]").val()
            var lastName = template.$("input[name=lastName]").val()
            var phone = template.$("input[name=phone]").val()
            var address = template.$("input[name=address]").val()
            console.info(phone);
            Meteor.users.update(Meteor.userId(), {$set: {
                "profile.firstName": firstName,
                "profile.lastName": lastName,
                "profile.phone": phone,
                "profile.address": address
            }})
        }
    })
    
}