var express=require('express');
var bodyparser=require('body-parser');
var user_repo=require('./repo/users');
var userdb_repo=require('./repo/userdb');
var cookieSession=require('cookie-session');
var app=express();
// var datetime = currentdate.getDate() + "/"
//                 + (currentdate.getMonth()+1)  + "/" 
//                 + currentdate.getFullYear();
//  console.log(datetime);
app.use(bodyparser.urlencoded({extended:true}));

app.use(cookieSession({
	keys:['1234567']
}));

app.set("view engine","ejs");

app.get('/',valid,(req,res)=>{
	res.send("hi there :");
})
app.get('/signup',(req,res)=>{
	res.render('auth/signup',{error:''});
})

app.post('/signup',async(req,res)=>{
	const existinguser=await user_repo.check(req.body);
	if(!req.body.password.length){
		res.render('auth/signup',{error:'Please enter a valid password'});
	}
	if(existinguser){
		res.render('auth/signup',{error:'User with given username already exists'});
	}else{
		const user=await user_repo.create(req.body);
		await userdb_repo.create(user.id,user.username);
		req.session.userID=user.id;
		res.redirect(`/user/${user.id}`);
	}	
})

app.get('/signin',(req,res)=>{
	res.render('auth/signin',{error:''});
})

app.post('/signin',async (req,res)=>{
	const user=await user_repo.check(req.body);
	if(user&&req.body.password===user.password){
		req.session.userID=user.id;
		res.redirect(`/user/${user.id}`);
	}else{
		if(user){
			res.render('auth/signin',{error:'Incorrect password'});
		}else{
			res.render('auth/signin',{error:'User does not exist'});
		}
	}
});

app.get('/logout',(req,res)=>{
	req.session=null;
	res.redirect('/signin');
})
app.get('/user/:id/add',valid,(req,res)=>{
	res.render('new',{id:req.params.id});
})
app.post('/user/:id/add',valid,async(req,res)=>{
	await userdb_repo.pushdata(req.params.id,req.body);
	res.redirect(`/user/${req.params.id}`);
})
app.get('/user/:id/edit',(req,res)=>{
	res.render('edit',{id:req.params.id});
})
app.post('/user/:id/edit',async(req,res)=>{
	var oldobj={};
	oldobj.link=req.body.oldlink;
	var newobj={};
	newobj.link=req.body.newlink;
	newobj.title=req.body.newtitle;
	await userdb_repo.edit(req.params.id,oldobj,newobj);
	res.redirect(`/user/${req.params.id}`);
})
app.get('/user/:id/delete',(req,res)=>{
	res.render('delete',{id:req.params.id});
})
app.post('/user/:id/delete',async(req,res)=>{
	await userdb_repo.delete(req.params.id,req.body);
	res.redirect(`/user/${req.params.id}`);
})
app.get('/user/:id',valid,async(req,res)=>{
	const obj=await userdb_repo.getById(req.params.id);
	// userdb_repo.nuweek()
	res.render('userpage',{arr:obj});
})
app.get('/error',(req,res)=>{
	res.send('Page does not exist');
})
function valid(req,res,next){
	if(req.session.userID){
		return next();
	}
	res.redirect('/signin');
}

app.listen(3000,(req,res)=>{
	console.log("Server running on port 3000");
});