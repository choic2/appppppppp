"use strict";
exports.__esModule = true;
var Mongoose = require("mongoose");
var DataAccess_1 = require("./../DataAccess");
var mongooseConnection = DataAccess_1.DataAccess.mongooseConnection;
var mongooseObj = DataAccess_1.DataAccess.mongooseInstance;
var QuestionBankModel = /** @class */ (function () {
    function QuestionBankModel() {
        this.createSchema();
        this.createModel();
    }
    QuestionBankModel.prototype.createSchema = function () {
        this.schema = new Mongoose.Schema({
            questionBankID: Number,
            questionBankName: String,
            duration: Number,
            numberOfQuestions: Number,
            keyConcepts: String,
            status: String,
            createdDate: Date,
            lastmodifiedDate: Date,
            createdBy: String,
            updatedBy: String
        }, { collection: 'questionBanks' });
    };
    QuestionBankModel.prototype.createModel = function () {
        this.model = mongooseConnection.model("QuestionBanks", this.schema);
    };
    QuestionBankModel.prototype.retrieveAllQuestionBanks = function (response) {
        var query = this.model.find({});
        query.exec(function (err, itemArray) {
            response.json(itemArray);
        });
    };
    QuestionBankModel.prototype.retrieveQuestionBankDetails = function (response, filter) {
        var query = this.model.find(filter);
        query.exec(function (err, itemArray) {
            response.json(itemArray);
        });
    };
    QuestionBankModel.prototype.deleteQuestionBank = function (response, filter) {
        var query = this.model.findOneAndRemove(filter);
        query.exec(function (err, itemArray) {
            if (!err) {
                response.json(itemArray);
            }
            else {
                console.log(err);
            }
        });
    };
    return QuestionBankModel;
}());
exports.QuestionBankModel = QuestionBankModel;
