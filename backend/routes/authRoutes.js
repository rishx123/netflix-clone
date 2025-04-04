const express=require('express');
const router=express.Router();
const passport=require('passport');
const User=require('../models/User')
router.post('/register', async(req,res)=>{
    try{
        const isAdmin=req.body.isAdmin
        const user=await User.register(new User({username: req.body.username, isAdmin}), req.body.password);
        passport.authenticate('local')(req,res,()=>{
            res.json({success: true,user });
        })}
catch(error){
    res.status(500).json({success:false, error: error.message});
}
    }
)
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',(err,user, info)=>{
        if(err){
            return res.status(500).json({success:false, error:err.message});
        }
        if(!user){
        return res.json({success:false, message:'authentication failed'});
        }
        req.logIn(user,(loginErr)=>{
            if(loginErr){
                return res.status(500).json({success:false, error:loginErr.message});
            }
            return res.json({success:true, user});
    })
})(req,res,next)
})
router.get('/check-auth',(req,res)=>{
    console.log("user auth", req.isAuthenticated)
    if(req.isAuthenticated()){
        res.json({authenticated:true, user:req.user});
    }else{
        res.json({authenticated:false, user:null});
    }
})
router.get('/logout',(req,res)=>{
    req.logout(err=>{
        if(err){
            return res.status(500).json({success:false, error:err.message});
        }
        res.json({success:true})
    })

})
router.get('/admin/register',(req,res)=>{
    res.render('adminRegister')
})
router.post('/admin/register',async (req,res)=>{
    try{
        const secretCode=req.body.secretCode;
        if(secretCode!=='abcd1234'){
            return res.render('adminRegister',{errorMessage:'invalid secret code'});
        }
        const isAdmin=true;
        const user=User.register(new User({username:req.body.username, isAdmin}), req.body.password);
        passport.authenticate('local')(req,res,()=>{
            //res.json({success:true, user});
            res.redirect('/admin/login');
        });
    }catch(error){
        res.status(500).json({success:false, error:error.message});
    }
})
router.get('/admin/login',(req,res)=>{
    res.render('adminLogin')
})
router.post('/admin/login',(req, res, next)=>{
    passport.authenticate('local',(err,user,info)=>{
        if(err){
            return res.status(500).json({success:false, error:err.meassage});
        }
        if(!user){
            return res.render('adminLogin',{errorMessage:'Authentiaction failed'});
        }
        if(!user.isAdmin){
            return res.render('adminLogin',{errorMessage:'you are not an admin'});
        }
        req.login(user, (loginErr)=>{
            if(loginErr){
                return res.status(500).json({success:false, error:loginErr.meassage});
            }
            res.redirect('/');
        })
    })(req,res,next);
})
router.get('/admin/logout',(req,res)=>{
    req.logout(err=>{
        if(err){
            return res.status(500).json({success:false, errro:err.message});
        }
    })
})
module.exports=router;