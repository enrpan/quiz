var models = require('../models/models.js');

// Autoload - factoriza el codigo si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [ {model: models.Comment } ]	
	}).then( function(quiz) {
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

		models.Quiz.findAll( {where: ["pregunta like ?", txtBusqueda], order: 'pregunta ASC'} ).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
		}).catch( function(error) { next(error); });
	} else {
		models.Quiz.findAll({order: 'pregunta ASC'}).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
		}).catch( function(error) { next(error); });
	}

};



// GET /quizes/:quizId
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:quizId/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta ) {
		resultado = 'Correcto';
	} 
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tematica: "Otro"}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// GET /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz );

	console.log(req.body.quiz);

	// guarda en BD los campos pregunta y respuesta de quiz
	quiz.validate().then( function(err) {
		if (err) {
			res.render('quizes/new', {quiz: quiz, errors: err.errors });
		} else {
			quiz.save( {fields: ["pregunta", "respuesta", "tematica"]} ).then( function() {
				res.redirect('/quizes') })
		}
	});
};


// GET /quizes/:quizId/edit
exports.edit = function(req, res) {
	res.render('quizes/edit', { quiz: req.quiz, errors: [] });
};

// PUT /quizes/:idQuiz
exports.update = function(req, res) {
	req.quiz.pregunta  = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tematica  = req.body.quiz.tematica;


	// guarda en BD los campos pregunta y respuesta de quiz
	req.quiz.validate().then( function(err) {
		if (err) {
			res.render('quizes/edit', {quiz: req.quiz, errors: err.errors });
		} else {
			req.quiz.save( {fields: ["pregunta", "respuesta", "tematica"]} ).then( function() {
				res.redirect('/quizes') })
		}
	});
};

// DELETE /quizes/:quizId
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function () {
		res.redirect('/quizes');
	}).catch( function(error) { next(error)});
	
};
