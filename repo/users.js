const fs=require('fs');
const crypto=require('crypto');

class repo_user{
	constructor(filename){
		this.filename=filename;
		try{
			fs.accessSync(this.filename);
		}catch(err){
			fs.writeFileSync(this.filename,'[]');
		}
	}

	async getAll(){
		return JSON.parse(
			await fs.promises.readFile(this.filename,{
				encoding:'utf8'
			})
		)
	}

	async writeAll(records){
		await fs.promises.writeFile(
			this.filename,
			JSON.stringify(records,null,2)
		);
	}
	randomId(){
		return crypto.randomBytes(4).toString('hex');
	}
	async create(attrs){
		attrs.id=this.randomId();
		const records=await this.getAll();
		records.push(attrs);
		await this.writeAll(records);
		return attrs;
	}
	async getById(id){
		const records=await this.getAll();
		for(let record of records){
			if(record[id]===id)return record;
		}
	}

	async update(attrs){
	    const records=await this.getAll();
	    let found =false;
	    for(let record of records){
	    	if(record[id]===attrs[id]){
	    		for(let val in attrs){
	    			record[val]=attrs[val];
	    		}
	    		return;
	    	}
	    }
	    throw new Error(`Record with id ${attrs[id]} not found`);
	}
	async delete(id){
		const records=await this.getAll();
		const newrecords=records.filter(record=>record.id!==id);
		await this.writeAll(records);
	}
	async getOneBy(attrs){
		const records=await this.getAll();
	
		for(let record of records){
			let found =true;
			for(let key in attrs){
				if(record[key]!==attrs[key]){
					found=false;
				}
			}
			if(found){
				return record;
			}
		}
	}
	async check(attrs){
		const records=await this.getAll();

		for(let record of records){
			if(record.username===attrs.username)return record;
		}
	}
}
module.exports=new repo_user('users.json');