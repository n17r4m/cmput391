
DB = {
    Users:  Meteor.users,
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
    
    
}

if(Meteor.isClient){
    
    
}