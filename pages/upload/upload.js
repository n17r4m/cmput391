var fileExtentionRange = '.png .gif .jpg .jpeg .tif .tiff';
var MAX_SIZE = 30; // MB

FlowRouter.route('/upload', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "upload" });
    },
    name: "upload"
});

if (Meteor.isClient){
    
    Session.set("upload.images", [])
    Session.set("upload.group", false)
    
    Template.upload.onRendered(function(){
        this.$('input[name="date"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
        })
        this.$('.ui.dropdown').dropdown()
    })
    

    Template.upload.helpers({
        today: function(){
          return moment().format("MM/DD/YYYY")  
        },
        isGroupPermitted: function(){
            return Session.get("upload.group")
        },
        images: function(){
            // images uploaded in this session
            return DB.Images.find({_id: {$in: Session.get("upload.images")}})
        }
    })

    
    Template.upload.events({
        'change select[name=permitted]': function(event, template){
            var isGroup = $(event.currentTarget).val() == "group"
            Session.set("upload.group", isGroup)
            if(!isGroup){
                $(".privacy.field .ui.dropdown.selection").each(function(){
                    if($(this).find("select[name=permitted]").length == 0){
                        $(this).remove()
                    }
                })
            }
        },
        'change #fileInput': debounce(function(event, template) {
            FS.Utility.eachFile(event, function(file) {
                // Attach metadata
                try {
                    newFile = new FS.File(file)
                    newFile.owner = Meteor.userId()
                    newFile.metadata = {
                        title: (function(){
                            var title = template.$("input[name=title]").val()
                            if(title) return title; else throw new Error("You should set a title!")
                        })(),
                        location: template.$("input[name=location]").val(), 
                        date: moment(template.$("input[name=date]").val(), "MM/DD/YYYY").toDate(),
                        description: template.$("input[name=description]").val(),
                        permitted: template.$("select[name=permitted]").val(),
                        group: template.$("select[name=group]").val(), 
                        views: 0
                    }
                    
                    DB.Images.insert(newFile, function (err, fileObj) {
                        //Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                        Session.set("upload.images", Session.get("upload.images").concat(fileObj._id))
                        
                    })
                } catch (e){
                    alert(e.message)
                }
            });
        }, 500)
    });
    
    
    Template.uploadGroupDropdown.onRendered(function(){
        this.$('.ui.dropdown').dropdown()
    })
    
    Template.uploadGroupDropdown.helpers({
        groups: function(){
            return Roles.getRolesForUser(Meteor.userId()) 
        }
    })

    
}
