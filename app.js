const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exite(1)
  }
}

initializeDBAndServer()

const convertMoviesObjToResponseObj = dbObj => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  }
}

const convertDirectorObjToResponseObj = dbObj => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  }
}

//Return list of all movie names
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie;
  `
  const moviesList = await db.all(getMoviesQuery)
  response.send(
    moviesList.map(eachMovie => ({moveiName: eachMovie.movei_name})),
  )
})

//Return movie based on movie_id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
        SELECT * 
        FROM movie
        WHERE movie_id = ${movieId};
    `
  const movie = await db.get(getMovieQuery)
  response.send(convertMoviesObjToResponseObj(movie))
})

//Create new movie in movie table
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
        INSERT INTO 
        movie 
            (director_id, movie_name, lead_actor)
        VALUES
            (${directorId}, '${movieName}', '${leadActor}'); 
    `
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//Updates the details of movie
app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
        UPDATE movie
        SET director_id = ${directorId},
          movie_name = '${movieName}',
          lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};
    `
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete movie from movie table
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
        DELETE FROM
        movie 
        WHERE movie_id = ${movieId};
    `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get list of all directors
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
        SELECT * 
        FROM director;
    `
  const directorsList = await db.all(getDirectorsQuery)
  response.send(
    directorsList.map(eachDirector =>
      convertDirectorObjToResponseObj(eachDirector),
    ),
  )
})

//get all movie name specified by director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorsMovie = `
        SELECT movie_name
        FROM movie
        WHERE director_id = ${directorId};
    `
  const movieName = await db.all(getDirectorsMovie)
  response.send(
    movieName.map(eachMovie => ({
      movieName: eachMovie.movie_name,
    })),
  )
})

module.exports = app
