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
        scores = [],
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
                    records.each (function ( err , record ) {
                        if ( record == null ) {
                            mongoClient.close ();
                            buildScoreBoards(scores, loggedInUser, req, res);
                        }
                        else {
                            if( record.username == req.params.user ){ 
                                loggedInUser  = record;
                            }
                            scores.push(record);
                        }
                    });
                } );
        }
    );
};

function buildScoreBoards(scores, loggedInUser, req, res){
    res.render ( 'leaderboard' , {
        title : "FaceGame Leaderboard" ,
        userScoreboard : buildUserScoreboard(scores, scores.indexOf(loggedInUser)),
        topScorers : scores.slice(0, 10),
        currentUser : loggedInUser == null ? '' : loggedInUser.username,
        trophies : [ 'gold', 'silver', 'bronze' ]
    } );
}

function buildUserScoreboard(scores, indexOfLoggedInUser){
    
    if(indexOfLoggedInUser < 0) {
        return null;
    }

    if(scores.length <= 7){
        return scores;
    }

    if(indexOfLoggedInUser < 3){
        return scores.slice(0, 7);
    }

    if(indexOfLoggedInUser > scores.length - 4){
        return scores.slice(-7);
    }

    return scores.slice(indexOfLoggedInUser - 3, indexOfLoggedInUser + 4);
};