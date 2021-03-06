import Mongoose = require("mongoose");
import {DataAccess} from './../DataAccess';
import {IQuestionsModel} from '../interfaces/IQuestionsModel';

let mongooseConnection = DataAccess.mongooseConnection;
let mongooseObj = DataAccess.mongooseInstance;

class QuestionsModel {
  public schema:any;
  public model:any;

  public constructor() {
    this.createSchema();
    this.createModel();
  }

  public createSchema(): void {
    this.schema = new Mongoose.Schema(
      {
        questionBankID: Number,
        questionBankName: String,
        questionID: Number,
        questionText: String,
        category: String,
        options: [String, String, String, String],
        answer: String
      }, {collection: 'questions'}
    );
  }

  public createModel(): void {
    this.model = mongooseConnection.model<IQuestionsModel>("questions", this.schema);
  }

  public retrieveAllQuestions(response:any): any {
    var query = this.model.find({});
    query.exec( (err, itemArray) => {
      if (!err)
      {
        response.json(itemArray) ;
      }
      else
      {
        console.log(err);
      }
    });
  }

  public retrieveQuestionsDetails(response:any, filter:Object) {
    var query = this.model.find(filter);
    query.exec( (err, itemArray) => {
      if (!err)
      {
        response.json(itemArray) ;
      }
      else
      {
        console.log(err);
      }
    });
  }

  public retrieveQuestionByID(response:any, filter:Object) {
    var query = this.model.find(filter);
    query.exec( (err, itemArray) => {
      if (!err)
      {
        response.json(itemArray) ;
      }
      else
      {
        console.log(err);
      }
    });
  }

  public deleteQuestion(response:any, filter:Object) {
      var query = this.model.findOneAndRemove(filter);
      query.exec( (err, itemArray) => {
      if (!err)
      {
        response.json(itemArray) ;
      }
      else
      {
        console.log(err);
      }
    });
  }
}

export {QuestionsModel};
