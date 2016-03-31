
DB = {
    Users:  Meteor.users,
    Roles:  Meteor.roles,
    Images: new FS.Collection("images", {
        stores: [
            new FS.Store.GridFS("thumbnails", { 
                beforeWrite: function(fileObj) {
                    return { extension: 'jpg', type: 'image/jpeg' }
                },
                transformWrite: function (fileObj, readStream, writeStream) {
                    // Transform the image into a 150x150px jpeg thumbnail
                    gm(readStream, fileObj.name())
                        .resize(300)
                        .stream('JPEG')
                        .pipe(writeStream);
                }
            }),
            new FS.Store.GridFS("images", {
                beforeWrite: function(fileObj) {
                    return { extension: 'jpg', type: 'image/jpeg' }
                },
                transformWrite: function (fileObj, readStream, writeStream) {
                    gm(readStream, fileObj.name())
                        .stream('JPEG')
                        .pipe(writeStream);
                }
            })
        ],
        filter: {
            allow: { contentTypes: ['image/*'] /* allow only images */ }
        }
    })
}

moment.updateLocale('en', {
    calendar : {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'll'
    }
})




if(Meteor.isServer){
    Meteor.publish("allUserData", function () {
        return Meteor.users.find({}, {fields: {roles: 1}});
    });
}

if(Meteor.isClient){
    
    Tracker.autorun(function () {
        Meteor.subscribe("allUserData");
    });
    
    // https://github.com/kadirahq/flow-router/issues/153
    Template.registerHelper("accessDenied", function() {
        FlowRouter.go("/prohibited");
    });    
    
}