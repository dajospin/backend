var mongoose = require( 'mongoose' );
var dbURI = 'mongodb+srv://alainjospind:190702@mekanbul.nzgbkks.mongodb.net/';
mongoose.connect(dbURI);
mongoose.connection.on("connected",function(){
    console.log(dbURI+ "adresindaki  veritabani   baglandi\n")
});
mongoose.connection.on("error",function(){
    console.log( "baglanti hatasi\n ")
});

mongoose.connection.on("disconnected",function(){
    console.log(dbURI+ " baglanti\n")
});

//uygulama kapadiginda kapat

process.on("SIGINT",function(){
    mongoose.connection.close();
    console.log("Baglanti kapatildi");
    process.exit(0);
});

require("./venue"); 
