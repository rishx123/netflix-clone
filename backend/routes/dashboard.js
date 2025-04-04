const express=require('express');
const router=express.Router();

function isAdminAuthtenticated(req, res, next){
    if(req.isAuthenticated() &&req.user.isAdmin){
        return next()
    }
    res.redirect('/admin/login')
}

router.get('/',isAdminAuthtenticated,(req,res)=>{
    res.render('dashboard');
})
router.get('/addMovieRoute',isAdminAuthtenticated, (req,res)=>{
    res.render('addMovieList')
})
module.exports=router;