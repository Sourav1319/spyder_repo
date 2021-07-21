var express=require('express');
var bodyparser=require('body-parser');
var user_repo=require('./repo/users');
var userdb_repo=require('./repo/userdb');
var cookieSession=require('cookie-session');
var app=express();

app.use(bodyparser.urlencoded({extended:true}));

app.use(cookieSession({keys:['12345678']
}));
app.use(express.static(__dirname+'/public'));
app.set("view engine","ejs");

app.get('/',valid,(req,res)=>{
	res.redirect('/signin');
})
app.get('/signup',(req,res)=>{
	res.render('auth/signup',{error:''});
})

app.post('/signup',async(req,res)=>{
	req.body.username=req.body.username.trim().toLowerCase();
	req.body.password=req.body.password.trim();
	const existinguser=await user_repo.check(req.body);
	if(!req.body.password.length){
		res.render('auth/signup',{error:'Please enter a valid password'});
	}
	if(existinguser){
		res.render('auth/signup',{error:'User with given username already exists'});
	}else{
		if(req.body.image.length===0){
			req.body.image="https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg";
		}
		const user=await user_repo.create(req.body);
		await userdb_repo.create(user.id,user.username,user.image);
		req.session.userID=user.id;
		res.redirect(`/user/${user.id}`);
	}	
})

app.get('/signin',(req,res)=>{
	res.render('auth/signin',{error:''});
})

app.post('/signin',async (req,res)=>{
	req.body.username=req.body.username.trim().toLowerCase();
	req.body.password=req.body.password.trim();
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
app.get('/user/:id/edit',valid,(req,res)=>{
	res.render('edit',{id:req.params.id});
})
app.post('/user/:id/edit',valid,async(req,res)=>{
	var oldobj={};
	oldobj.link=req.body.oldlink;
	var newobj={};
	newobj.link=req.body.newlink;
	newobj.title=req.body.newtitle;
	await userdb_repo.edit(req.params.id,oldobj,newobj);
	res.redirect(`/user/${req.params.id}`);
})
app.get('/user/:id/delete',valid,(req,res)=>{
	res.render('delete',{id:req.params.id});
})
app.post('/user/:id/delete',valid,async(req,res)=>{
	await userdb_repo.delete(req.params.id,req.body);
	res.redirect(`/user/${req.params.id}`);
})
app.get('/user/:id',async(req,res)=>{

	const obj=await userdb_repo.getById(req.params.id);
	res.render('userpage',{arr:obj,reid:req.session.userID});
})
app.get('/:id',(req,res)=>{
	res.send('<img style="width:100%;" src="/images/404.gif">');
})
function valid(req,res,next){
	if(req.session.userID===req.params.id){
		return next();
	}
	res.redirect('/signin');
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
}) 