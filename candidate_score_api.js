//Requiring neccessary modules
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')


//Setting up the express server
const app = express()
app.use(cors())
app.use(bodyParser.json())



//Mongoose database connectivity
mongoose.connect('mongodb+srv://bibek:bibekv21234@cluster0.e2v72.mongodb.net/candidateTestScoreDB', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

//Creating schema and model
const Schema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    Email_Address: {
        type: String,
        required: true,
        unique: true
    },
    Test_Score: {
        First_Round: {
            type: Number,
            required: true,
            min: [0, 'Score cannot be negative'],
            max: [10, 'Max score is 10']
        },
        Second_Round: {
            type: Number,
            required: true,
            min: [0, 'Score cannot be negative'],
            max: [10, 'Max score is 10']
        },
        Third_Round: {
            type: Number,
            required: true,
            min: [0, 'Score cannot be negative'],
            max: [10, 'Max score is 10']
        }

    }

})
const CandidateModel = mongoose.model('TestScore', Schema)


//Creating routes

app.get('/', (req, res) => {
    res.send("Hello")
})

//To Get All Candidate Details
app.get('/getAllCandidates', async (req, res) => {
    await CandidateModel.find((err, foundAllCandidates) => {
        if (err) {
            res.send(err.message)
        }
        else {
            if (foundAllCandidates) {
                res.send(foundAllCandidates)
            }
            else {
                res.send(`Sorry there has no candidate data`)
            }
        }
    })
})

//To Insert One Candidate Details
app.post('/insertCandidateScore', async (req, res) => {
    const { Name, Email_Address, First_Round, Second_Round, Third_Round } = req.body

    await CandidateModel.findOne({ Name: Name }, (err, foundCandidate) => {
        if (err) {
            res.send("An error occured during saving the details!")
        }
        else {
            if (foundCandidate) {
                if (foundCandidate.Email_Address === Email_Address && foundCandidate.Name === Name) {
                    res.send("This candidate is already present in the database")
                }
                else {
                    const newCandidate = new CandidateModel({
                        Name: Name,
                        Email_Address: Email_Address,
                        Test_Score: {
                            First_Round: First_Round,
                            Second_Round: Second_Round,
                            Third_Round: Third_Round
                        }
                    })
                    newCandidate.save((err) => {
                        if (err) {
                            res.send(err.message)
                        }
                        else {
                            res.send('Candidate details successfully saved!!')
                        }
                    })

                }
            }
            else {
                const newCandidate = new CandidateModel({
                    Name: Name,
                    Email_Address: Email_Address,
                    Test_Score: {
                        First_Round: First_Round,
                        Second_Round: Second_Round,
                        Third_Round: Third_Round
                    }
                })
                newCandidate.save((err) => {
                    if (err) {
                        res.send(err.message)
                    }
                    else {
                        res.send('Candidate details successfully saved!!')
                    }
                })

            }

        }
    })
})

//To Get The Highest Scoring Candidate Details
app.get('/highestScoringCandidate', async (req, res) => {

    await CandidateModel.find((err, foundAllCandidates) => {
        if (err) {
            res.send(err.message)
        }
        else {
            if (foundAllCandidates) {
                let totalMarks = []
                let highestScoringCandidate = []
                let highestMarks = 0
                for (let i of foundAllCandidates) {
                    let total = i.Test_Score.First_Round + i.Test_Score.Second_Round + i.Test_Score.Third_Round
                    totalMarks.push({
                        Name: i.Name,
                        Email_Address: i.Email_Address,
                        First_Round_Marks: i.Test_Score.First_Round,
                        Second_Round_Marks: i.Test_Score.Second_Round,
                        Third_Round_Marks: i.Test_Score.Third_Round,
                        Total_Marks: total
                    })
                }

                for (let i of totalMarks) {
                    if (highestMarks < i.Total_Marks) {
                        highestMarks = i.Total_Marks
                    }
                }

                for (let i of totalMarks) {
                    if (i.Total_Marks === highestMarks) {
                        highestScoringCandidate.push(i)
                    }
                }

                res.send(highestScoringCandidate)
            }
            else {
                res.send(`Sorry there has no candidate data`)
            }
        }
    })

})

//To Get The Average Scored For Each Round Scored By All Candidates
app.get('/averageScore', async (req, res) => {

    await CandidateModel.find((err, foundAllCandidates) => {
        if (err) {
            res.send(err.message)
        }
        else {
            if (foundAllCandidates) {
                let averageScorePerRound = { First_Round_Average: 0, Second_Round_Average: 0, Third_Round_Average: 0 }
                let totalFirstRoundMarks = 0
                let totalSecondRoundMarks = 0
                let totalThirdRoundMarks = 0

                let countOfCandidates = foundAllCandidates.length

                for (let i of foundAllCandidates) {
                    totalFirstRoundMarks = totalFirstRoundMarks + i.Test_Score.First_Round
                }


                averageScorePerRound.First_Round_Average = totalFirstRoundMarks / countOfCandidates

                for (let i of foundAllCandidates) {
                    totalSecondRoundMarks = totalSecondRoundMarks + i.Test_Score.Second_Round
                }

                averageScorePerRound.Second_Round_Average = totalSecondRoundMarks / countOfCandidates

                for (let i of foundAllCandidates) {
                    totalThirdRoundMarks = totalThirdRoundMarks + i.Test_Score.Third_Round
                }

                averageScorePerRound.Third_Round_Average = totalThirdRoundMarks / countOfCandidates

                res.send(averageScorePerRound)

            }
            else {
                res.send(`Sorry there has no candidate data`)
            }
        }
    })

})

app.listen(4000, () => {
    console.log("Server is running at port 4000!!")
})
