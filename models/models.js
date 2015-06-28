var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name 	= (url[6]||null);
var user 		= (url[2]||null);
var pwd 		= (url[3]||null);
var protocol 	= (url[1]||null);
var dialect 	= (url[1]||null);
var port 		= (url[5]||null);
var host 		= (url[4]||null);
var storage 	= process.env.DATABASE_STORAGE;


// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
	{ dialect: protocol,
 	  protocol: protocol,
 	  port: port,
 	  host: host,
 	  storage: storage, // solo SQLite (.env)
 	  omitNull: true // solo Postgres
 	}
);

// Importar la definición de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

// Importar la definición de la tabla Comment en comment.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // exportar definición de tabla Quiz
exports.Comment = Comment; // exportar definición de tabla Comment

// sequelize.sync() crea e inicializa la tabla de preguntas en BBDD
sequelize.sync().then(function() {
	Quiz.count().then(function (count) {
		if (count===0) {
			Quiz.create({ pregunta: 'Capital de Italia', respuesta: 'Roma', tematica: "Humanidades"});
			Quiz.create({ pregunta: 'Capital de Portugal', respuesta: 'Lisboa', tematica: "Humanidades"})
			.then(function() { console.log('Base de datos inicializada') });
		};
	});
});