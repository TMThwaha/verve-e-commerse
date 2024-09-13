const userdb=require("../model/UserModel")

const mongoose=require('mongoose')


//back preventing
const Authenticated = (req, res, next) => {
    if(req.session.user){
        // console.log("session have user right",req.session.user);
        res.redirect("/")
    }else{
        // console.log("session have user vvvvvvv right");
        next()
    }
}


const userthere= (req, res, next) => {

    if(req.session.user){
        // console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  if condition')
        
       next()
    }else{
        // console.log('userrrrrrrrrrrrrrrrrrrrr thre middle ware  else condition')
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




// const blockedUser= async(req,res,next)=>{
   
//     console.log("user hhhhhhhhhhhh ",req.session.user)
//     const id = req.session.user._id
    
    
//     const User=await userdb.findById(id)
//     console.log('user indoooooooooooooooooooo',User);
//     if(!User){
//         console.log("nooo userrr");
//         next()
//     }
//     else if(!User.status){
//         req.session.destroy(err=>{
//             if(err){
//                 console.error(err);
//             }else{
//                 res.render('user/blockedUser')
//             }
//         })
      
//     }else{
//         console.log("unblocked");
//         next()
//     }

// }





const blockedUser = async (req, res, next) => {
    try {
        // console.log("user hhhhhhhhhhhh ", req.session.user);

        // Make sure the session has a valid user ID
        const id = req.session.user ? req.session.user._id : null;
        if (!id) {
            // console.log("No user ID found in session");
            return next();
        }

        // Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            // console.log("Invalid user ID format");
            return next();
        }

        // Fetch the user by ID
        const user = await userdb.findById(id);

        // console.log('user found: ', user);

        if (!user) {
            // console.log("No user found with the given ID");
            return next();
        }

        // If the user is blocked (status = false), destroy the session
        if (!user.status) {
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session: ", err);
                    return next(err);  // Move to error handler if session destruction fails
                } else {
                    res.render('user/blockedUser');  // Render blocked user page
                }
            });
        } else {
            console.log("User is not blocked");
            next();
        }
    } catch (err) {
        console.error("Error in blockedUser middleware: ", err);
        next(err);  // Pass error to the error handler
    }
};




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