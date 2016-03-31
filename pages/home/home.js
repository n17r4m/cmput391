FlowRouter.route('/', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "home" });
    },
    name: "home"
});

if(Meteor.isClient){
    Template.home.helpers({
        top5: function(){
            return DB.Images.find({
                "metadata.permitted": "public",
                $or: [
                    { "owner": Meteor.userId() },
                    { "metadata.permitted": "public" },
                    { $and: [
                        { "metadata.permitted": "group" },
                        { "metadata.group": { $in: Roles.getRolesForUser(Meteor.userId()) } }
                    ]}
                ]
            },{
                sort: {"metadata.views": -1},
                limit: 5
            })
        }
    })
}