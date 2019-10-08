const express = require('express');

const xss = require('xss');
const ArticlesService = require('./articles-service.js');

const articlesRouter = express.Router();
const jsonParser = express.json();

articlesRouter
  .route('/')
  .get((req, res, next) => {
    ArticlesService.getAllArticles( req.app.get('db') )
      .then(articles => { 
        res.json(articles.map(article => ({
          id: article.id,
          title: xss(article.title),
          style: article.style,
          content: xss(article.content),
          date_published: new Date(article.date_published),
          author: article.author,
        })));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, style,author } = req.body;
    const newArticle = { title, content, style };
    for (const [key, value] of Object.entries(newArticle)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    newArticle.author = author;
    ArticlesService.insertArticle( req.app.get('db'), newArticle )
      .then(article => {
        res.status(201)
          .location(`/articles/${article.id}`)
          .json({
            id: article.id,
            style: article.style,
            title: xss(article.title),
            content: xss(article.content),
            date_published: new Date(article.date_published),
            author: article.author,
          });
      })
      .catch(next);
  });

articlesRouter
  .route('/:article_id')
  .all((req, res, next) => {
    ArticlesService.getById( req.app.get('db'), req.params.article_id )
      .then(article => {
        if (!article) {
          return res.status(404).json({ error: { message: 'Article doesn\'t exist' } });
        }
        //res.article = article // save the article for the next middleware
        res.json({
          id: article.id,
          title: xss(article.title),
          style: article.style,
          content: xss(article.content),
          date_published: new Date(article.date_published),
          author: article.author,
        });
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: article.id,
      title: xss(article.title),
      style: article.style,
      content: xss(article.content),
      date_published: new Date(article.date_published),
      author: article.author,
    });
  })
  .delete((req, res, next) => { 
    ArticlesService.deleteArticle( req.app.get('db'), req.params.article_id )
      .then(numRowsAffected =>  res.status(204).end() )
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content, style } = req.body;
    console.log('reached patch route');
    const articleToUpdate = { title, content, style };
    const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length;
    
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: 'Request body must contain either \'title\', \'style\' or \'content\''}
      });
    }
    ArticlesService.updateArticle(
      req.app.get('db'),
      req.params.article_id,
      articleToUpdate
    )
      .then(numRowsAffected => { res.status(204).end(); })
      .catch(next);


  });

module.exports = articlesRouter;
