FlowRouter.route('/admin', {
    action: function(params, queryParams) {
        BlazeLayout.render('applicationLayout', { main: "admin"});
    },
    name: "admin"
});


if(Meteor.isClient){
    
    var DATE_RANGE_FORMAT = "MM/DD/YYYY"
    
    Template.admin.onRendered(function(){
        Session.setDefault("admin.user", "");
        Session.setDefault("admin.subject", "");
        Session.setDefault("admin.timespan", "all");
        Session.setDefault("admin.daterange", [moment().subtract(1, "weeks").toDate(), moment().toDate()]);
        this.$('input[name="daterange"]').daterangepicker({
            singleDatePicker: false,
            showDropdowns: true,
        })
        this.$('.ui.dropdown').dropdown()
    })
    
    Template.admin.helpers({
        
        calendar: function(m){ 
            return moment(m).calendar() 
        },
        
        daterange: function(){
            var daterange = Session.get("admin.daterange")
            return moment(daterange[0]).format(DATE_RANGE_FORMAT) 
                 + " - " 
                 + moment(daterange[1]).format(DATE_RANGE_FORMAT)
                
        },
        
        user: function(){ 
            return DB.Users.findOne({username: Session.get("admin.user")}) 
        }, 
        
        userNotFound: function(){
            return Session.get("admin.user") 
                && !DB.Users.findOne({username: Session.get("admin.user")})
        },
        
        subject: function(){ return Session.get("admin.subject") },
        
        timeslots: function(){
            var daterange = Session.get("admin.daterange")
            switch(Session.get("admin.timespan")){
                
                case "year": 
                    var years = []
                    var start = moment(daterange[0]).year()
                    var end = moment(daterange[1]).add(1, "year").year()
                    for (var y = start; y < end; y++ ){
                        years.push({start: moment(y + "-01-01"), end: moment((y+1) + "-01-01")})
                    }
                    return years
                case "month":
                    var months = []
                    var start = moment(daterange[0]).date(1)
                    var end = moment(daterange[1]).add(1, "month").date(1)
                    for (var m = start; m.isBefore(end); m.add(1, 'months')){
                        months.push({start: m.clone(), end: m.clone().add(1, 'months')})
                    }
                    return months
                case "week":
                    var weeks = []
                    var start = moment(daterange[0]).day(0)
                    var end = moment(daterange[1]).day(7)
                    for (var w = start; w.isBefore(end); w.add(1, 'weeks')){
                        weeks.push({start: w.clone(), end: w.clone().add(1, 'weeks')})
                    }
                    return weeks
                case "all": 
                default:
                    return [{start: moment(daterange[0]), end: moment(daterange[1])}]
            }
            //return [daterange1, daterange2, ...]
            return []
        },
        
        numimages: function(start, end){
            var user = DB.Users.findOne({username: Session.get("admin.user")}) 
            var subject = Session.get("admin.subject")
            var query = {
                "metadata.date": {$gte: start.toDate(), $lt: end.toDate() }
            }
            if(user){ query.owner = user._id }
            if(subject) { query["metadata.title"] = { $regex: new RegExp(subject, "i") } } 
            
            return DB.Images.find(query).count()
        }
    })
    
    
    Template.admin.events({
        'click, change input[name=user]': function(event, template){
            Session.set("admin.user", template.$("input[name=user]").val())
        },
        'click, change input[name=subject]': function(event, template){
            Session.set("admin.subject", template.$("input[name=subject]").val())
        },
        'change select[name=timespan]': function(event, template){
            Session.set("admin.timespan", template.$("select[name=timespan]").val())
        },
        'change input[name=daterange]': function(event, template){
            var daterange = template.$("input[name=daterange]").val()
                    .split(" - ")
                    .map(function(date){ 
                        return moment(date, DATE_RANGE_FORMAT).toDate() 
                    })
            Session.set("admin.daterange", daterange)
        }
    })
}