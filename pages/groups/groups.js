FlowRouter.route('/groups', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "groups"});
    },
    name: "groups"
});


if(Meteor.isClient){

    Template.groups.onRendered(function(){
        Session.set("groups.selected", null)
        Session.set("groups.topmessage", "")
        Session.set("groups.bottommessage", "")
        
    })
    
    Template.groups.helpers({
        topmessage: function(){
            return Session.get("groups.topmessage")
        },
        bottommessage: function(){
            return Session.get("groups.bottommessage")
        },
        groups: function(){
            return Meteor.user().roles
        },
        count: function(){
            return DB.Users.find({roles: this.toString()}).count()
        },
        selectedgroup: function(){
            return Session.get("groups.selected")
        },
        groupusers: function(){
            return DB.Users.find({roles: this.toString()})
        }
    })
    
    Template.groups.events({
        'click a.back': function(event, template){
          Session.set("groups.selected", null)  
        },
        'click a.group': function(event, template){
            Session.set("groups.selected", $(event.currentTarget).text())
        },
        'click a.remove': function(event, template){
            var username = $(event.currentTarget).data("username")
            Meteor.call("groupsRemoveUser", Session.get("groups.selected"), username, function(error, message){
                if(!error){ Session.set("groups.topmessage", message) } 
                else { Session.set("groups.topmessage", error.message) }
            })
        },
        'click .invite.button': function(event, template){
            var username = template.$("input[name=username]").val()
            Meteor.call("groupsAddUser", Session.get("groups.selected"), username, function(error, message){
                if(!error){ Session.set("groups.topmessage", message) } 
                else { Session.set("groups.topmessage", error.message) }
            })
        },
        'submit .form': function(event, template){
            event.preventDefault();
            
            var groupNameInput = template.$("input[name=groupName]")
            var groupName = groupNameInput.val()
            
            Meteor.call("groupsCreate", groupName, function(error, message){
                if(!error){
                    groupNameInput.val("")
                    Session.set("groups.bottommessage", message)
                } else {
                    Session.set("groups.bottommessage", error.message)
                }
            })
            
        }
    })
    
}

if (Meteor.isServer) {
    Meteor.methods({
        groupsCreate: function(groupName){
            var exists = DB.Roles.findOne({name: groupName})
            if(groupName && groupName != "admin" && this.userId && !exists){
                Roles.addUsersToRoles(this.userId, groupName)
                return "Group created."
            } else {
                throw new Meteor.Error("group-exists", "Group already exists.");
            }
        },
        groupsAddUser: function(groupName, username){
            var exists = DB.Roles.findOne({name: groupName})
            var user = DB.Users.findOne({username: username})
            if(groupName != "admin" && user && exists){
                Roles.addUsersToRoles([user], groupName)
                return "You invited " + user.username + " to the " + groupName + " group."
            } else {
                if(!user){
                    throw new Meteor.Error("user-not-exists", "User does not exist");
                } else if (!exists) {
                    throw new Meteor.Error("group-not-exists", "Group does not exist!?");
                } else {
                    throw new Meteor.Error("group-unknown-error", "Something bad happened");
                }
            }
        },
        groupsRemoveUser: function(groupName, username){
            var exists = DB.Roles.findOne({name: groupName})
            var user = DB.Users.findOne({username: username})
            if(groupName != "admin" && user && exists){
                Roles.removeUsersFromRoles([user], groupName)
                return "You removed " + user.username + " from the " + groupName + " group."
            } else {
                if(!user){
                    throw new Meteor.Error("user-not-exists", "User does not exist");
                } else if (!exists) {
                    throw new Meteor.Error("group-not-exists", "Group does not exist!?");
                } else {
                    throw new Meteor.Error("group-unknown-error", "Something bad happened");
                }
            }
        }
    })
}