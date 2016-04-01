FlowRouter.route('/view/:imageId', {
    subscriptions: function(params, queryParams) {
        //this.register('images', Meteor.subscribe('images'));
        //this.register('items', Meteor.subscribe('items'));
    },
    action: function(params, queryParams) {
        Session.set("view.image", params.imageId)
        DB.Images.update(params.imageId, {$inc: {"metadata.views": 1} })
        BlazeLayout.render('applicationLayout', { main: "view" });
    },
    name: "view"
});

if(Meteor.isClient){
    
    
    Session.set("view.image", null)
    
    Template.view.onRendered(function(){
        Session.set("view.edit", false)
    })
    
    Template.view.helpers({
        calendar: function(){ return moment(this.metadata.date).calendar(null) },
        owner:    function(){ return DB.Users.findOne(this.owner).username },
        image:    function(){ return DB.Images.findOne(Session.get("view.image")) },
        isOwner:  function(){ return Meteor.isAdmin() || Meteor.userId() == this.owner },
        editing:  function(){ return Session.equals("view.edit", true) } 
    })
    
    Template.view.events({
        "click button.edit": function(event, template){
            Session.set("view.edit", true)
        },
        "click button.delete": function(event, template){
            if(confirm("Are you sure that you want to delete this image permanently?")){
                DB.Images.remove(Session.get("view.image"))
                alert("Image removed.")
                FlowRouter.go("home")
            }
        }
        
    })
    
    Template.editimage.onRendered(function(){
        Session.set("editimage.group", null)
        this.$('input[name="date"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
        })
        this.$('.ui.dropdown').dropdown()
    })
    
    Template.editimage.helpers({
        dateformatted: function(){
            return moment(this.date).format("MM/DD/YYYY")
        },
        isPermitted: function(opt){
          return this.permitted == opt  
        },
        isGroupPermitted: function(){
            return (
                this.permitted == "group" 
                && Session.equals("editimage.group", null)
            ) || Session.get("editimage.group") 
        },
        groups: function(){
            return Roles.getGroupsForUser(Meteor.userId()) 
        },
    })
    
    Template.editimage.events({
        'change select[name=permitted]': function(event, template){
            var isGroup = $(event.currentTarget).val() == "group"
            Session.set("editimage.group", isGroup)
            if(!isGroup){
                $(".privacy.field .ui.dropdown.selection").each(function(){
                    if($(this).find("select[name=permitted]").length == 0){
                        $(this).remove()
                    }
                })
            }
        },
        'click .save.button': function(event, template){
            try { 
                DB.Images.update(Session.get("view.image"), {$set: {
                    "metadata.title": (function(){
                        var title = template.$("input[name=title]").val()
                        if(title) return title; else throw new Error("You should set a title!")
                    })(),
                    "metadata.location": template.$("input[name=location]").val(), 
                    "metadata.date": moment(template.$("input[name=date]").val(), "MM/DD/YYYY").toDate(),
                    "metadata.description": template.$("input[name=description]").val(),
                    "metadata.permitted": template.$("select[name=permitted]").val(),
                    "metadata.group": template.$("select[name=group]").val()
                }})
                Session.set("view.edit", false)
            } catch (e) {
                alert(e.message)
            }
        },
        'click .cancel.button': function(event, template){
            Session.set("view.edit", false)
        }
    })
    
    
    Template.editImageGroupDropdown.onRendered(function(){
        this.$('.ui.dropdown').dropdown()
    })
    
    Template.editImageGroupDropdown.helpers({
        groups: function(){
            return Roles.getRolesForUser(Meteor.userId()) 
        },
        isGroup: function(imgGroup, thisGroup){
            return imgGroup == thisGroup
        },
    })

    
}