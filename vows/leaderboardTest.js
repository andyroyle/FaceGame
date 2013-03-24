var vows = require ( 'vows' ),
    assert = require ( 'assert' ),
    sinon = require ( 'sinon' ),
    mockHelper = require ( './helper/mock-helper' ),
    proxyquire = require ( 'proxyquire' ).noCallThru (),

    dependencies = {},

    resMock = { render : sinon.stub () },
    reqMock = { params: { user : "someuser" }, body : {} , session : {} },
    runRoute = function (routeInTest) {
        routeInTest.leaderboard ( reqMock , resMock );
        return {
        };
    };

vows.describe ( 'Viewing the leaderboard' ).addBatch ( {
    'When viewing the leaderboard' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "someuser" , score : 60},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies );

            return runRoute (routeInTest);
        } ,
        "the entire user list should be retrieved sorted by score" : function( topic ) {
            var mongoFind = dependencies.mongodb.Collection.find,
                parameters = mongoFind.args[0];
            assert ( mongoFind.called );
        },
        "the score index should be ensured" : function ( topic ) {
            var mongoIndex = dependencies.mongodb.Collection.ensureIndex,
                parameters = mongoIndex.args[0];
            assert ( mongoIndex.called );
            assert.strictEqual ( parameters[0] , "score" );
        }
    }
} ).addBatch ( {
    'When viewing the leaderboard with a logged in user' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "user1" , score : 100},
                            { username : "user2" , score : 90},
                            { username : "user3" , score : 80},
                            { username : "user4" , score : 70},
                            { username : "someuser" , score : 60},
                            { username : "user5" , score : 50},
                            { username : "user6" , score : 40},
                            { username : "user7" , score : 30},
                            { username : "user8" , score : 20},
                            { username : "user9" , score : 10},
                            { username : "user10" , score : 0},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies ),
            reqMock = { params: { user : "someuser" }, body : {} , session : {} };
            return runRoute (routeInTest);
        },
        "the topScorers list should contain 10 users" : function ( topic ) {
            assert.strictEqual ( resMock.render.lastCall.args[1].topScorers.length, 10 );
        },
        "the userScoreboard list should contain 7 users" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard.length, 7 );
        },
        "the currentUser should be set" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].currentUser, "someuser" );
        }
    }
} ).addBatch ( {
    'When viewing the leaderboard where the logged in user is the top scorer' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "someuser" , score : 60},
                            { username : "user5" , score : 50},
                            { username : "user6" , score : 40},
                            { username : "user7" , score : 30},
                            { username : "user8" , score : 20},
                            { username : "user9" , score : 10},
                            { username : "user10" , score : 0},
                            { username : "user11" , score : -10},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies ),
            reqMock = { params: { user : "someuser" }, body : {} , session : {} };

            return runRoute (routeInTest);
        } ,
        "the userScoreboard list should contain 7 users" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard.length, 7 );
        },
        "the logged in user should be at the top of the list" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard[0].username, "someuser" );
        }
    }
} ).addBatch ( {
    'When viewing the leaderboard where the logged in user is in the middle of the scores' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "user1" , score : 100},
                            { username : "user2" , score : 90},
                            { username : "user3" , score : 80},
                            { username : "user4" , score : 70},
                            { username : "someuser" , score : 60},
                            { username : "user5" , score : 50},
                            { username : "user6" , score : 40},
                            { username : "user7" , score : 30},
                            { username : "user8" , score : 20},
                            { username : "user9" , score : 10},
                            { username : "user10" , score : 0},
                            { username : "user11" , score : -10},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies ),
            reqMock = { params: { user : "someuser" }, body : {} , session : {} };

            return runRoute (routeInTest);
        } ,
        "the userScoreboard list should contain 7 users" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard.length, 7 );
        },
        "the logged in user should be in the middle of the list" : function (topic) {

            var expected = [
                { username : "user2" , score : 90},
                { username : "user3" , score : 80},
                { username : "user4" , score : 70},
                { username : "someuser" , score : 60},
                { username : "user5" , score : 50},
                { username : "user6" , score : 40},
                { username : "user7" , score : 30}
            ]

            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard, expected );
        }
    }
} ).addBatch ( {
    'When viewing the leaderboard where the logged in user is the bottom scorer' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "user1" , score : 100},
                            { username : "user2" , score : 90},
                            { username : "user3" , score : 80},
                            { username : "user4" , score : 70},
                            { username : "user5" , score : 50},
                            { username : "user6" , score : 40},
                            { username : "user7" , score : 30},
                            { username : "user8" , score : 20},
                            { username : "user9" , score : 10},
                            { username : "user10" , score : 0},
                            { username : "user11" , score : -10},
                            { username : "someuser" , score : -20},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies ),
            reqMock = { params: { user : "someuser" }, body : {} , session : {} };

            return runRoute (routeInTest);
        } ,
        "the userScoreboard list should contain 7 users" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard.length, 7 );
        },
        "the logged in user should be at the end of the list" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].userScoreboard.slice(-1)[0].username, "someuser" );
        }
    }
} ).addBatch ( {
    'When viewing the leaderboard without a logged in user' : {
        topic : function () {
            dependencies = {
                'mongodb' : mockHelper.mongoStub ( {
                    find : sinon.stub ().yields ( null, 
                        mockHelper.cursorStub ( [
                            { username : "someuser" , score : 60},
                            null
                        ] )
                    ) ,
                    ensureIndex : sinon.stub ().yields ( null , "index" )
                } )
            };
            var routeInTest = proxyquire ( '../routes/leaderboard' , dependencies );

            reqMock = { params: {}, body : {} , session : {} };
            resMock = { render : sinon.stub () };
            return runRoute (routeInTest);
        } ,
        "the userScoreboard list should be null" : function (topic) {
            assert.strictEqual( resMock.render.lastCall.args[1].userScoreboard, null );
        },
        "the currentUser should not be set" : function (topic) {
            assert.strictEqual ( resMock.render.lastCall.args[1].currentUser, "" );
        }
    }
} ).export ( module );