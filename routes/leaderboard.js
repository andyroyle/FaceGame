/*
 * ALL leader board
 */

var assert      = require ( 'assert' )        ,
    settings    = require ( '../util/settings' ).dbSettings,
    MongoClient = require ( 'mongodb' ).MongoClient,
    MongoServer = require ( 'mongodb' ).Server,
    userData;

exports.leaderboard = function ( req , res ) {
    var mongoClient = new MongoClient ( new MongoServer ( settings.host , settings.port ) , {w : 1} ),
        userScoreboard = { complete: false, entries: [] },
        topScorers = { complete: false, entries: [] },
        loggedInUser;
    mongoClient.open (
        function ( err , mongoClient ) {
            assert.equal(null,err);

            var userData = mongoClient.db ( 'FaceGame' ).collection ( 'UserData' );

            userData.ensureIndex ( "score" ,
                function ( error , index ) {
                    if ( error ) throw error;
                } );

            userData.find ( {} ,
                { "sort"  : [ ['score', 'desc'] ]} ,
                function ( err , records ) {
                    assert.equal ( null , err );

                    records.each (
                        function ( err , record ) {
                            if ( record == null || (userScoreboard.complete && topScorers.complete)) {
                                
                                mongoClient.close ();
                                
                                res.render ( 'leaderboard' , {
                                    title : "FaceGame Leaderboard" ,
                                    userScoreboard : userScoreboard.complete ? userScoreboard.entries : null,
                                    topScorers : topScorers.entries,
                                    currentUser : loggedInUser == null ? '' : loggedInUser.username
                                } );
                            }
                            else {

                                buildUserScoreboard(record, userScoreboard, loggedInUser);
                                buildTopScorers(record, topScorers);

                                if( record.username == req.params.user ){ 
                                    loggedInUser  = record;
                                }
                            }
                        } );
                } );
        }
    );
};

function buildUserScoreboard(record, userScoreboard, loggedInUser){
    if(userScoreboard.complete){
        return;
    }

    userScoreboard.entries.push( record );
    
    if( userScoreboard.entries.length > 7 ){
        userScoreboard.entries.shift();
    }

    if(loggedInUser != null && userScoreboard.entries.indexOf(loggedInUser) == 3){
        userScoreboard.complete = true;
    }
};

function buildTopScorers(record, topScorers){
    if( topScorers.entries.length < 10 ){
        topScorers.entries.push( record );
    }
    else{
        topScorers.complete = true;
    }
}