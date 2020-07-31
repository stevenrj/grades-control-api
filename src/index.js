import express from 'express'
import gradesRouter from './routes/grades.js'

global.gradesJSON = './JSON/grades.json'
const app = express()

app.set('port', 3000)
app.use(express.json())
app.use('/grades', gradesRouter)

app.listen(app.get('port'), () => {
  console.log('API Started');
})