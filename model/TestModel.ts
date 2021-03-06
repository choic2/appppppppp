import Mongoose = require("mongoose");
import {DataAccess} from './../DataAccess';
import {ITestModel} from '../interfaces/ITestModel';
import {IQuestionsModel} from '../interfaces/IQuestionsModel';

let mongooseConnection = DataAccess.mongooseConnection;
let mongooseObj = DataAccess.mongooseInstance;
class TestModel {
    public schema:any;
    public model:any;
    public questionSchema:any;
    public questionModel:any;

    public constructor() {
        this.createSchema();
        this.createModel();
    }
    public createSchema(): void {
        this.schema = new Mongoose.Schema(
            {
              testID : Number,
              testTakerID : Number,
              questionBankID : Number,
              questionID : Number,
              orderOfQuestionInTest : Number,
              category : String,
              // isCorrect will be 0 incorrect, 1 will be correct
              isCorrect : Number,
            }, {collection: 'test'}
        );

      this.questionSchema = new Mongoose.Schema(
        {
          questionBankID: Number,
          questionID: Number,
          questionText: String,
          category: String,
          options: [String, String, String, String],
          answer: String,
        }, {collection: 'questions'}
      );
    }
    public createModel(): void {
        this.model = mongooseConnection.model<ITestModel>("Test", this.schema);
        this.questionModel = mongooseConnection.model<IQuestionsModel>("Question", this.questionSchema);
    }

    // Gets all tests
    public retrieveAllTests(response:any): any {
      var query = this.model.find({});
      query.exec( (err, itemArray) => {
        if (!err) {
          response.json(itemArray);
        } else {
          console.log(err);
        };
      });
    }

    // Gets all test records with one TestID
    public retrieveOneTest(response:any, filter:Object) {
      var query = this.model.find(filter);
      query.exec( (err, itemArray) => {
          if (!err) {
              response.json(itemArray);
          } else {
              console.log(err);
          };
      });
    }


    // Gets random question as the first question on a test
    public retrieveRandomQuestion(response:any, questionbankid: any) {
      var query = this.questionModel.find({questionBankID: Number(questionbankid)}).sort({questionID: 'desc'});
      query.exec( (err, itemArray) => {
          if (!err) {
            let randomQuestionNumber = Math.floor((Math.random() * itemArray.length));
            console.log(itemArray);
            response.json(itemArray[randomQuestionNumber]);
          } else {
            console.log(err);
          };
      });
    }

    // Returns new testID for a new test
  public retrieveTestID(response:any, questionbankid: any, testtakerid: any) {
    var generateTestID = this.model.find({questionBankID: Number(questionbankid), testTakerID: Number(testtakerid)}).sort({testID: "desc"});
    generateTestID.exec( (err, testHistory) => {
      if(!err){
        if(testHistory.length > 0){
          var testID = testHistory[0]['testID'] + 1;
          response.json(testID);
        } else{
          response.json(1);                }
        }else{
          console.log(err);
        }
      });
  }


    // Gets question questions 2 -> end of test
    public retrieveNextQuestion(response: any, id: any, testid: any, testtakerid: any){
      // Get test history
      var queryTestHistory = this.model.find({testID: testid}).select('questionID isCorrect testtakerid').sort({orderOfQuestionInTest: "desc"});
      queryTestHistory.exec( (err, testHistory) => {
        if (!err){
          console.log("retrieveCurrentTestHistory: No Error");
          console.log("question array: ", testHistory);

          // Generate array of only question IDs
          var i: any;
          var testHistoryQuestionIDArray: Number[] = new Array();
          for(i = 0; i < testHistory.length; i++){
            testHistoryQuestionIDArray.push(testHistory[i]['questionID']);
          }
          console.log("Cannot be any one of these ids: ", testHistoryQuestionIDArray);

          // If last answered question was incorrect
          if(testHistory[0]['isCorrect'] == 0){
            // Find last correct answer
            var mustGenerateRandomQuestion = true;
            for(i = 0; i < testHistory.length; i++){
              // If answered correctly, search all questions for new question in
              // that category
              if(testHistory[i]['isCorrect'] == 1){
                var cat = testHistory[i]['category'];
                var queryNewQuestionInSpecificCategory = this.questionModel.findOne({questionBankID: id, questionID: {"$nin": testHistoryQuestionIDArray}, category: cat});
                queryNewQuestionInSpecificCategory.exec( (err, result) => {
                  if(!err){
                    //If no error and valid question, send response
                    //Otherwise, continue for loop
                    if(result != null){
                      console.log("Next question is: ", result);
                      response.json(result);
                      mustGenerateRandomQuestion = false;
                    }
                  } else {
                    console.log(err);
                  }
                });
                if(!mustGenerateRandomQuestion){
                  break;
                }
              }
            }
          }

          // If last answered question was correct
          if(testHistory[0]['isCorrect'] == 1){
            var queryNewQuestionNotInCategory = this.questionModel.findOne({questionBankID: id, category: {"$nin": cat}, questionID: {"$nin": testHistoryQuestionIDArray}});
            queryNewQuestionNotInCategory.exec( (err, result) => {
              if(!err){
                // If there are more questions in that category send response
                // Otherwise prepare to generate random question
                if(result != null){
                  console.log("Answered correct. Next question is: ", result);
                  response.json(result);
                  mustGenerateRandomQuestion = false;
                } else{
                  console.log(err);
                }
              }
            });
          }

          if(mustGenerateRandomQuestion){
            var queryRandomQuestion = this.questionModel.findOne({questionBankID: id, questionID: {"$nin": testHistoryQuestionIDArray}});
            queryRandomQuestion.exec( (err, result) => {
              if(!err){
                console.log("Generated random question: ", result);
                response.json(result);
              } else{
                console.log(err);
              }
            });
          }
        } else{
          console.log(err);
        }
      });
    }

    // Gets test results to be used in reports
    public getSingleReportInfo(response:any, testTakerID:Number,
      questionBankID:Number ) {
      //find newest test num
      var query = this.model.findOne({testTakerID: testTakerID,
      questionBankID:questionBankID}).sort('-testID');
      var newestTestID;

      query.exec( (err, itemArray) => {
        if (!err && itemArray != null) {

          newestTestID = itemArray.testID;
          //grab test results based on params
          var query2 = this.model.find({testID: newestTestID,
          testTakerID: testTakerID,
          questionBankID:questionBankID});

          query2.exec((err, itemArray) => {
            if (!err) {
              response.json(itemArray);
            }
            else {
              console.log(err);
            };
          });

        } else {
          if (itemArray == null)
            console.log('no test results data');
          console.log(err);
          };
      });
    }
}
export {TestModel};
