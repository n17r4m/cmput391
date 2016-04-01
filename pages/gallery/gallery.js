

var setSession = function(params, queryParams){
    if(Meteor.isClient){
        if(params.when){
            Session.set("gallery.when", params.when)
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


if (Meteor.isClient){
    
    var DATE_RANGE_URL_FORMAT = "MM.DD.YYYY"
    var DATE_RANGE_VAL_FORMAT = "MM/DD/YYYY"
    
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
                case "today": query["metadata.date"] = { $gte: moment().subtract(1, "days").toDate() };   break;
                case "week":  query["metadata.date"] = { $gte: moment().subtract(1, "weeks").toDate() };  break;
                case "month": query["metadata.date"] = { $gte: moment().subtract(1, "months").toDate() }; break;
                default:
                    var daterange = when.split("-")
                        .map(function(date){ 
                            return moment(date, DATE_RANGE_URL_FORMAT).toDate()
                        })
                    query["metadata.date"] = { $gte: daterange[0], $lte: daterange[1] }
            }
            
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
            
            return DB.Images
                .find(query, {sort: {"metadata.date": order}})
                .fetch()
                .map(function(img, i){ img.position = i; return img;})
                .sort(sorter)
            
        }
    })


    
    var quickSearchEvent = function(event, template){
        if(event){ event.preventDefault() }
        template = template || window
        
        var order = template.$(".ui.checkbox.radio.newest").checkbox("is checked") ? -1 : 1
        Session.set("gallery.order", order)
        
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
    }
    var slowSearchEvent = debounce(quickSearchEvent, 1500)

    Template.galleryFilterBar.onRendered(function(){
        this.$('.ui.radio.checkbox').checkbox({
            onChange: quickSearchEvent
        })
        this.$('input.range').daterangepicker({
            singleDatePicker: false,
            showDropdowns: true
        })
    })

    Template.galleryFilterBar.helpers({
        keywords: function() { return Session.get("gallery.keywords") },
        keywordsvalue: function() { return Session.get("gallery.keywords").split(",").join(" ") },
        when: function() { return Session.get("when") },
        whenvalue: function() { 
            switch(Session.get("gallery.when")){
                case "today": 
                    return moment().subtract(1, "days").format(DATE_RANGE_VAL_FORMAT)
                        + " - " + moment().format(DATE_RANGE_VAL_FORMAT)
                case "week":
                    return moment().subtract(1, "weeks").format(DATE_RANGE_VAL_FORMAT)
                        + " - " + moment().format(DATE_RANGE_VAL_FORMAT)
                case "month":
                    return moment().subtract(1, "months").format(DATE_RANGE_VAL_FORMAT)
                        + " - " + moment().format(DATE_RANGE_VAL_FORMAT)
                default:
                    return Session.get("gallery.when")
                        .split("-").join(" - ").replace(/\./g, "/")     
            }
        },
        isNewest: function(){ return Session.equals("gallery.order", -1) },
        isOldest: function(){ return Session.equals("gallery.order", 1) }
    })
    
    Template.galleryFilterBar.events({
        "click .search": quickSearchEvent,
        "keyup .search": slowSearchEvent,
        "click a.range": function(event, template){
            template.$('input.range').click()
        },
        "change input.range": function(event, template){
            Session.set("gallery.when", template.$("input.range").val()
                .split(" - ")
                .map(function(date){ 
                    return moment(date, DATE_RANGE_URL_FORMAT).format(DATE_RANGE_URL_FORMAT)
                }).join("-")
            )
            quickSearchEvent(event, template)        
        }
            
    })
    
    
}
