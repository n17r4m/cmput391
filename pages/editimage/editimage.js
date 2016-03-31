var fileExtentionRange = '.png .gif .jpg .jpeg .tif .tiff';
var MAX_SIZE = 30; // MB

FlowRouter.route('/edit/image/:id', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "upload" });
    },
    name: "editimage"
});

if (Meteor.isClient){
    
    
    Session.set("editimage.group", false)
    
    
    Template.editimage.events({ });
    
    Template.editimage.helpers({
        today: function(){
          return moment().format("MM/DD/YYYY")  
        },
        isGroupPermitted: function(){
            return Session.get("upload.group")
        },
        groups: function(){
            return Roles.getGroupsForUser(Meteor.userId()) 
        },
        images: function(){
            // images uploaded in this session
            return DB.Images.find({_id: {$in: Session.get("upload.images")}})
        }
    })

    
}
