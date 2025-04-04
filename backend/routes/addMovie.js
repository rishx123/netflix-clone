require('dotenv').config()
const express=require('express');
const router=express.Router()
const Movie=require('../models/movie')


router.post('/fetch-movie', async(req,res)=>{
    let search_term=req.body.searchTerm
    
    //console.log(`Searched: ${search_term}`)
    try{
        const url = `https://api.themoviedb.org/3/search/movie?query=${search_term}&include_adult=false&language=en-US&page=1`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: process.env.TMDB_AUTH_KEY
        }
    }
    const responseData=await fetch(url,options)
    const result=await responseData.json()
    //console.log("Full API response:", result); 
    if (result.success === false) {
        console.error('TMDB API Error:', result.status_message);
        return res.status(401).json({ 
            error: 'Failed to fetch movie details',
            details: result.status_message
        });
    }

    // Check if results exists and is an array
    if (!result.results || !Array.isArray(result.results)) {
        return res.status(404).json({ error: 'Invalid API response format' });
    }
    if(result.results.length === 0){
        return res.status(404).json({error: 'No movies found with the given name'});
    }
    res.render('addMovieList', {movieList: result.results})



}catch(error){
    console.error(error);
    res.status(500).json({error:'Failed to fetch movie details'});
    
}

    
})
router.get('/addMovie/:movieId', async(req,res)=>{
    const movieId=req.params.movieId;
    //console.log(movieId);
    //res.json({movieId})
    try{
//         if (!process.env.TMDB_AUTH_KEY) {
//             throw new Error('API key not configured');
//         }
const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: process.env.TMDB_AUTH_KEY
            }
        };
        
         const responseData=await fetch(url, options)
          const movieDetails= await responseData.json()

        const watchProviderUrl=`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`;
         const watchProvidersResponse= await fetch(watchProviderUrl,options)
         const watchProvidersResult= await watchProvidersResponse.json()

         const watchProviders=Object.keys(watchProvidersResult.results).filter((country) => country==="IN").map((country)=>{
            const countryData=watchProvidersResult.results[country];
            return{
                country,
                providerName:countryData.flatrate ? countryData.flatrate[0]?.provider_name:countryData.buy[0]?.provider_name
            }

         })
          
          movieDetails.watchProviders=watchProviders
          const genreIds=movieDetails.genres.map(genre=>genre.id);
          const genreNames=movieDetails.genres.map(genre=>genre.name)
          movieDetails.genreIds=genreIds;
          movieDetails.genres=genreNames;
          movieDetails.production_companies=movieDetails.production_companies.map(company=> company.name)
          movieDetails.watchProviders=movieDetails.watchProviders.map(provider=> provider.name)
          res.render('addMovie', { movieDetails } )
    

    }catch(error) {
        console.error('Error details:', {
            message: error.message,
            envKey: process.env.TMDB_AUTH_KEY ? 'exists' : 'missing',
            keyPrefix: process.env.TMDB_AUTH_KEY?.substring(0, 7)
        });
        res.status(500).json({error: 'failed to fetch movie details', details: error.message});
    }
 })

 router.post('/add-movie-details', async(req, res)=>{
    try{

    
    const movieDetails=req.body
    //console.log(movieDetails)
    //const genreIds=movieDetails.genreIds.split(',').map(id=>Number(id));
    //console.log("genres id: ", genreIds)
 const existingMovie=await Movie.findOne({movieId: movieDetails.id})
if (existingMovie){
    console.log(`movie with movieId ${movieDetails.id} already exists. skipping`)
    return res.status(400).json({error: `movie with movieId ${movieDetails.id} alreday exists. skipping. ` });
}
const newMovie = new Movie({
    movieId: movieDetails.id,
    backdropPath: 'https://image.tmdb.org/t/p/original' + movieDetails.backdrop_path,
    budget: isNaN(Number(movieDetails.budget)) ? 0 : Number(movieDetails.budget),
    genreIds: movieDetails.genreIds,
    genres: movieDetails.genres.split(','),
    originalTitle: movieDetails.original_title,
    overview: movieDetails.overview,
    ratings: isNaN(Number(movieDetails.ratings)) ? 0 : Number(movieDetails.ratings),
    popularity: isNaN(Number(movieDetails.popularity)) ? 0 : Number(movieDetails.popularity),
    posterPath: 'https://image.tmdb.org/t/p/original' + movieDetails.poster_path,
    productionCompanies: movieDetails.production_companies,
    releaseDate: movieDetails.releaseDate,
    revenue: isNaN(Number(movieDetails.revenue)) ? 0 : Number(movieDetails.revenue),
    runtime: isNaN(Number(movieDetails.runtime)) ? 0 : Number(movieDetails.runtime), // Add validation
    status: movieDetails.status,
    title: movieDetails.title,
    watchProviders: movieDetails.watchProviders,
    logos: 'https://image.tmdb.org/t/p/original' + movieDetails.logos,
    downloadLink: movieDetails.downloadLink,
});

const saveMovie= await newMovie.save();
res.render('addMovie', {successMessage: 'Movie details submitted successfully'})
 } catch(error){
    console.error(error);
    res.status(500).json({error: 'failed to submit movie details'})
 }
})




module.exports=router;