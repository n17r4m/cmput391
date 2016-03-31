if(Meteor.isClient){
    Template.thumbnail.helpers({
        cal: function(){
            return moment(this.metadata.date).calendar(null)
        },
        owner: function(){
            return DB.Users.findOne(this.owner).username
        }
    })
}