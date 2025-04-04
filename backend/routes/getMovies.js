const express= require('express');
const router=express.Router();
const Movie= require('../models/movie')

router.get('/getMovies/:genreId?',async(req,res)=>{
    try{

        const { genreID }=req.params
        if(genreID){
            const moviesByGenre=await Movie.find({ genreIds: genreID })
            res.json(moviesByGenre)
        }else{
            const allMovies = await Movie.find();
            res.json(allMovies)
        }
        
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error');
    }
})
router.get('/getSimilarMovies/:movieID', async(req,res)=>{
    try{
        const { movieID }=req.params;
        const selectedMovie=await Movie.findById(movieID);
        if(!selectedMovie){
            return res.status(404).json({error: 'movie not found'});
        }
        const similarMovies = await Movie.find({
            genreIds: { $in: selectedMovie.genreIds},
            _id: { $ne: movieID}
        });
        res.json(similarMovies);
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error');
    }
})

router.get('/searchMovies/:movieName', async(req,res)=>{
    try{
        const{ movieName }= req.params;
        const matchingMovies=await Movie.find({title: {$regex: new RegExp(movieName, 'i')}});
        res.json(matchingMovies);
    }catch(error){
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

module.exports=router;