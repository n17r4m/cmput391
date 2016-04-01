FlowRouter.route('/', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "home" });
    },
    name: "home"
});

if(Meteor.isClient){
    Template.home.helpers({
        top5: function(){
            var query = {}
            if(!Meteor.isAdmin()){
                query.$or = [
                    { "owner": Meteor.userId() },
                    { "metadata.permitted": "public" },
                    { $and: [
                        { "metadata.permitted": "group" },
                        { "metadata.group": { $in: Roles.getRolesForUser(Meteor.userId()) } }
                    ]}
                ]
            }
            var views = Infinity
            return DB.Images.find(query ,{
                sort: {"metadata.views": -1},
                limit: 30
            }).fetch().reduce(function(list, img, i){
                if(i < 5){
                    views = img.metadata.views
                    return list.concat(img)
                } else {
                    if (views == img.metadata.views){
                        return list.concat(img)
                    } else {
                        return list
                    }
                }
            }, [])
        }
    })
}