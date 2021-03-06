import Mongoose = require("mongoose");
import {DataAccess} from './../DataAccess';
import {IAccountModel} from '../interfaces/IAccountModel';

let mongooseConnection = DataAccess.mongooseConnection;
let mongooseObj = DataAccess.mongooseInstance;
class AccountModel {
    public schema: any;
    public model:any;
    public constructor() {
        this.createSchema();
        this.createModel();
    }
    public createSchema(): void {
        this.schema = new Mongoose.Schema(
            {
                usernname: String,
                password: String,
                userid: Number,
                firstName: String,
                lastName: String,
                email: String,
                role: {
                    type: String,
                    enum : ['student','professor']
                }
            }, {collection: 'accounts'}
        );
    }
    public createModel(): void {
        mongooseConnection.models = {}
        this.model = mongooseConnection.model<IAccountModel>("Accounts", this.schema);
    }

    public saveUser(data) {
        var myData = new this.model(data);
        myData.save()
            .then(item => {
                console.log("item saved to database");
            })
            .catch(err => {
                console.log("unable to save to database");
            });
    }

    // Gets account given filter parameters
    public retrieveAccountDetails(response:any, filter:Object) {
        var query = this.model.find(filter);
        query.exec( (err, itemArray) => {
            if (!err) {
                response.json(itemArray);
            } else {
                console.log(err);
            };
        });
    }
    // Gets all accounts
    public retrieveAllAcccounts(response:any): any {
        var query = this.model.find({});
        query.exec( (err, itemArray) => {
             if (!err) {
                response.json(itemArray);
            } else {
                console.log(err);
            };
        });
    }
}
export {AccountModel};




