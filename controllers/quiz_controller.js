var models = require('../models/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next( new Error('No existe quizId=' + quizId) );
			}
		}
	).catch( function(error) { next(error); });
};

// GET /quizes
exports.index = function(req, res) {
	if ( req.query.search ) {
		console.log("Busqueda: " + req.query.search );

		var txtBusqueda = "%" + req.query.search + "%";
		txtBusqueda = txtBusqueda.replace(/ /g, "%");

		console.log("Busqueda: " + txtBusqueda );

		models.Quiz.findAll( {where: ["pregunta like ?", txtBusqueda]} ).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes });
		}).catch( function(error) { next(error); });
	} else {
		models.Quiz.findAll().then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes });
		}).catch( function(error) { next(error); });
	}

};



// GET /quizes/:quizId
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz });
};

// GET /quizes/:quizId/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta ) {
		resultado = 'Correcto';
	} 
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado});
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	res.render('quizes/new', {quiz: quiz});
};

// GET /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	// guarda en BD los campos pregunta y respuesta de quiz
	quiz.save( {fields: ["pregunta", "respuesta"]} ).then( function() {
		res.redirect('/quizes');
	})
};
