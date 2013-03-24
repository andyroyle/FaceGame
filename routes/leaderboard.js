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
        userScoreboard = [],
        topScorers = [],
        loggedInUser;

    console.log(req.params.user);
    mongoClient.open (
        function ( err , mongoClient ) {
            assert.equal(null,err);

            var userData = mongoClient.db ( 'FaceGame' ).collection ( 'UserData' );

            userData.ensureIndex ( "score" ,
                function ( error , index ) {
                    if ( error ) throw error;
                } );

            userData.find ( {} ,
                {
                    "sort"  : [ ['score', 'desc'] ]
                } ,
                function ( err , records ) {
                    assert.equal ( null , err );

                    records.each (
                        function ( err , record ) {
                            if ( record == null 
                                || (loggedInUser != null && userScoreboard.indexOf(loggedInUser) == 3)) {
                                
                                mongoClient.close ();

                                res.render ( 'leaderboard' , {
                                    title : "FaceGame Leaderboard" ,
                                    userScoreboard : loggedInUser == null ? null : userScoreboard,
                                    topScorers : topScorers,
                                    currentUser : loggedInUser == null ? '' : loggedInUser.username
                                } );
                            }
                            else {
                                userScoreboard.push( record );
                                
                                if( userScoreboard.length > 7 ){
                                    userScoreboard.shift();
                                }

                                if( record.username == req.params.user){ 
                                    loggedInUser  = record;
                                }

                                if( topScorers.length < 10){
                                    topScorers.push( record );
                                }
                            }
                        } );
                } );
        }
    );
};