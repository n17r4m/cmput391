
DB = {
    Users:  Meteor.users,
    Images: new Meteor.Collection("images")
}

if(Meteor.isClient){
    
    Template.followingMenu.onRendered(function(){
        
        $(function() {
            // fix menu when passed
            $('.masthead').visibility({
                once: false,
                onBottomPassed: function() {
                    $('.fixed.menu').transition('fade in')
                },
                onBottomPassedReverse: function() {
                    $('.fixed.menu').transition('fade out')
                }
            });
        })
    })
    
    Template.sidebarMenu.onRendered(function(){

        $(function() {
            // create sidebar and attach to menu open
            $('.ui.sidebar').sidebar('attach events', '.toc.item');
        })
    })
      

}