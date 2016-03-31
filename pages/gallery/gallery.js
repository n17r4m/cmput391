
var whens = Object.create(null);
whens.hot = {}
whens.week = {}
whens.month = {}
whens.all = {}


var setSession = function(params, queryParams){
    if(Meteor.isClient){
        console.info(params)
        if(whens[params.when]){
            Session.set("gallery.when", params.when)
        } else {
            Session.set("gallery.when", "today")
        }
        if(params.keywords){
            Session.set("gallery.keywords", params.keywords)
        } else {
            Session.set("gallery.keywords", "")
        }
        Session.setDefault("gallery.order", -1)
    }
}

FlowRouter.route('/gallery', {
    action: function(params, queryParams) {
        setSession(params, queryParams);
        FlowRouter.redirect('/gallery/today');    
    },
    name: "gallery"
});

/*
FlowRouter.route('/group', {
    action: function(params, queryParams) {
        setSession(params, queryParams);
        FlowRouter.redirect('/gallery'); // not a typo    
    },
    name: "groop" // not a typo
});

FlowRouter.route('/group/:group', {
    action: function(params, queryParams) {
        setSession(params, queryParams);
        FlowRouter.redirect('/group/' + params.group + '/hot');    
    },
    name: "gallery_group_redirect"
});
*/


FlowRouter.route('/gallery/:when', {
    action: function(params, queryParams) {
        setSession(params, queryParams)
        BlazeLayout.render('applicationLayout', { main: "gallery"});
    },
    name: "gallery_when"
});

FlowRouter.route('/gallery/:when/:keywords', {
    action: function(params, queryParams) {
        setSession(params, queryParams)
        BlazeLayout.render('applicationLayout', { main: "gallery"});
    },
    name: "gallery_when_kw"
});

/*
FlowRouter.route('/group/:group/:when', {
    action: function(params, queryParams) {
        setSession(params, queryParams)
        BlazeLayout.render('applicationLayout', { main: "gallery"});
    },
    name: "gallery_group"
});

FlowRouter.route('/group/:group/:when/:keywords', {
    action: function(params, queryParams) {
        setSession(params, queryParams)
        BlazeLayout.render('applicationLayout', { main: "gallery"});
    },
    name: "gallery_group_kw"
});
*/

if (Meteor.isClient){
    
    Template.gallery.helpers({
        images: function(template){
            
                        
            var when = Session.get("gallery.when")
            var order = Session.get("gallery.order")
            var keywords = Session.get("gallery.keywords")
                .split(",")
                .filter(function(kw){ return kw })
                .map(function(kw){ return new RegExp(kw.toLowerCase()) })
            
            function frequency(string){
                return string.split(" ").reduce(function(sum1, term){
                    term = term.toLowerCase()
                    return sum1 + keywords.reduce(function(sum2, kw){
                        return sum2 + (term && term.match(kw) == null ? 0 : 1)
                    }, 0)
                }, 0)
            }
            
            function rank(img){
                return 6*frequency(img.metadata.title) 
                     + 3*frequency(img.metadata.location) 
                     + frequency(img.metadata.description)
            }
            
            function sorter(img1, img2){
                var r1 = rank(img1), r2 = rank(img2);
                return r1 > r2 ? -1 : (r1 < r2 ? 1 : (img1.position - img2.position))
            }
            
            var query = {}
            switch(when){
                case "today":
                    query["metadata.date"] = { $gte: moment().subtract(1, "days").toDate() }
                    break;
                case "week":
                    query["metadata.date"] = { $gte: moment().subtract(1, "weeks").toDate() }
                    break;
                case "month":
                    query["metadata.date"] = { $gte: moment().subtract(1, "months").toDate() }
                    break;
                case "all":
                default:
                    break;
            }
            
            query.$or = [
                { "owner": Meteor.userId() },
                { "metadata.permitted": "public" },
                { $and: [
                    { "metadata.permitted": "group" },
                    { "metadata.group": { $in: Roles.getRolesForUser(Meteor.userId()) } }
                ]}
            ]
            
            
            
            console.info(order, query, keywords)
            
            return DB.Images
                .find(query, {sort: {"metadata.date": order}})
                .fetch()
                .map(function(img, i){ img.position = i; return img;})
                .sort(sorter)
            
        }
    })
    
    var searchEvent = debounce(function(event, template){
        // todo: throttle
        if(event){ event.preventDefault() }
        template = template || window
        
        var order = template.$(".ui.checkbox.radio.newest").checkbox("is checked") ? -1 : 1
        Session.set("gallery.order", order)
        console.info(order)
        
        var keywords = template.$("input[name=keywords]").val()
            .replace(/[^a-z 0-9]/g, "")
            .split(" ")
            .filter(function(kw){ return kw; })
            .join(",")
        if(keywords){
            FlowRouter.redirect("/gallery/" + Session.get("gallery.when") + "/" + keywords)
        } else {
            FlowRouter.redirect("/gallery/" + Session.get("gallery.when"))
        }
    }, 1500)
    


    Template.galleryFilterBar.helpers({
        //group: function() { return Session.get("gallery.group") },
        //isGroup: function() { return Session.equals("gallery.mode", "group") },
        keywords: function() { return Session.get("gallery.keywords") },
        keywordsvalue: function() { return Session.get("gallery.keywords").split(",").join(" ") },
        getDate: function(){ return new Date(); },
        isNewest: function(){ return Session.equals("gallery.order", -1) },
        isOldest: function(){ return Session.equals("gallery.order", 1) }
    })
      
     
    Template.galleryFilterBar.onRendered(function(){
        this.$('.ui.radio.checkbox').checkbox({
            onChange: searchEvent
        })
    })
       
    Template.galleryFilterBar.events({
        "click .search": searchEvent,
        "keyup .search": searchEvent
    })
    
    
}
