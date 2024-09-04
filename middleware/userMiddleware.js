const userdb=require("../model/UserModel")


//back preventing
const Authenticated = (req, res, next) => {
    if(req.session.user){
        console.log("session have user right",req.session.user);
        res.redirect("/")
    }else{
        console.log("session have user vvvvvvv right");
        next()
    }
}


const userthere= (req, res, next) => {

    if(req.session.user){
        console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  if condition');
        
       next()
    }else{
        console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  else condition');
console.log('.........................................................................');

        return res.redirect("/user-login");
    }
}


 // sighup back preventing
const checkOtpVerfy = (req, res, next) => {
    if(req.session.checkOtpVerfy){
       return next();
    }else{
    return res.redirect("/")
    }
}




const blockedUser= async(req,res,next)=>{
   
    console.log("user hhhhhhhhhhhh ",req.session.userId)
    const id = req.session.userId
    
    
    const User=await userdb.findById(id)
    console.log('fdfdfffdffdfdfdfdfff',User);
    if(!User){
        console.log("nooo userrr");
        next()
    }
    else if(!User.status){
        req.session.destroy(err=>{
            if(err){
                console.error(err);
            }else{
                res.render('user/blockedUser')
            }
        })
      
    }else{
        console.log("unblocked");
        next()
    }

}



const adminthere= (req, res, next) => {

    if(req.session.admin){
        console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  if condition');
        
       next()
    }else{
        console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  else condition');
console.log('.........................................................................');
  return res.render('admin/adminLogin');
    }
}


const adminAuth=(req,res,next)=>{
    if(req.session.admin){
        console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
        

      return    res.redirect('/adminHome')
       
        }else{
            console.log("not admin")
            res.render('admin/adminLogin');
    }
}

// function chekkingUser(req,res,next) {
//     if(req.session.user){
//         next()
//     }else{   
//         req.session.noUserFound="Sorry, there was a technical error. Could you please try logging in again?"
//                 return res.redirect("/login")
//     }
// }


//  function CheckingUserInCart(req,res,next) {
//     if(req.session.user){
//         next()
//     }else{
//         req.session.cartError = "If you want to go to the cart, you must be logged in.";
//         return res.redirect("/");
//     } 
//     }
 

    // function CheckingUserInCartBotton(req,res,next) {
    //     console.log("kerndd ithil");
    //     if(req.session.user){
    //         next()
    //     }else{
    //         console.log("kerndd ithil");
    //         req.session.carterr = "If you want to go to the cart, you must be logged in.";
    //         return res.redirect("/ViewProduct/:id");
    //     } 
    //     }


        

module.exports ={
    Authenticated,
    checkOtpVerfy,
    blockedUser,
    // chekkingUser,
    // CheckingUserInCart,
    // CheckingUserInCartBotton,
    userthere,
    adminthere,
    adminAuth
}