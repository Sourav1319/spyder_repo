const fs=require('fs');

var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear();


class userdb_repo{
	constructor(filename){
		this.filename=filename;
		try{
			fs.accessSync(this.filename);
		}catch(err){
			fs.writeFileSync(this.filename,'[]');
		}
	}
	async getAll(){
		return JSON.parse(await fs.promises.readFile(this.filename,{
			encoding:'utf8'
		}))
	}
	async writeAll(records){
		await fs.promises.writeFile(this.filename,JSON.stringify(records,null,2));
	}
	async pushdata(id,newdata){
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				let newdate=currentdate.getDate();
				let date_=parseInt(record.date[0]+record.date[1]);
				let month=currentdate.getMonth()+1;
				let date_month=parseInt(record.date[3]+record.date[4]);
				let found=false;
				if(date_month!=month){
					if(month-date_month>1)found=true;
					else if(31-date_+newdate+1>=7)found=true;
				}
				else if(date_<newdate){
					if(newdate-date_>=7){
						found=true;
					}
				}
				if(found){
					record.date=datetime;
					var obj={};
					obj.date=datetime;
					obj.links=[newdata];
					record.info.unshift(obj);
					break;
				}else{
					record.info[0].links.push(newdata);
				}
			}
		}
		await this.writeAll(records);
	}
	async create(id,name,image){
		const records=await this.getAll();
		var obj={};
		obj.id=id;
		obj.username=name;
		obj.date=datetime;
		obj.image=image;
		obj.info=[{
				date:datetime,
				links:[]
		}];
		records.push(obj);
		await this.writeAll(records);
	}
	async getById(id){
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				return record;
			}
		}
		return {};
	}
	
	async edit(id,oldData,newdata){
		const records=await this.getAll();
		for(let record of records){
			if(record.id===id){
				for(let content of record.info){
					let i=0;
					for(let item of content.links){
						if(item.link===oldData.link){
							content.links[i].title=newdata.title;
							content.links[i].link=newdata.link;
							await this.writeAll(records);return;
						}
						i++;
					}
				}
			}
		}

	}
	
	async delete(id,data){
		const records=await this.getAll();
		let found=false;
		for(let record of records){
			if(record.id===id){
				let j=0;
				for(let content of record.info){
					const nu=[];
					for(let item of content.links){
						if(item.link!==data.link){
							nu.push(item);
						}else{
							found=true;
						}
					}
					if(found){
						record.info[j].links=nu;
						await this.writeAll(records);return;
					}
					j++;
				}
			}
		}
	}

}

module.exports=new userdb_repo('userdb.json');