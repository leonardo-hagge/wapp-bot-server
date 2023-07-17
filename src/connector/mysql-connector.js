var mysql = require('mysql2');


var con = mysql.createConnection({
    host: "127.0.0.1",
    port: '3306',
    username: "admin",
    password: "admin",
    database: 'chat_bot_bel'
});



function getconnection() {
    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
    });
    return con;
}






function selectAllConversations() {
    con.query("SELECT * FROM conversations", function (err, result) {
        if (err) throw err;
        console.log("Result: " + JSON.stringify(result));
    });
}
function insertNewConversation() {
    con.query("INSERT INTO conversations(user_number, conversation, date_creation) VALUES('SFSSDFSDF', 'SDFSDFSDFSDF',NOW() )", function (err, result) {
        if (err) throw err;
        console.log("Result: " + result);
    });
}


module.exports = { getconnection, selectAllConversations, insertNewConversation };


