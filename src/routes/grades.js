import express from 'express'
import { promises as fs } from 'fs'

const router = express.Router()

const validate = {
  error: () => { throw new Error('Parâmetros inválidos') },
  post: (grade) => {
    if (!grade || !grade.student || !grade.subject || !grade.type || grade.value === null || grade.value === undefined) {
      validate.error()
    }
  },
  put: (grade, body = null) => {
    validate.post(grade)
    if (!grade.id) {
      validate.error()
    }
    if (body) {
      validate.post(body)
    }
  }
}
router.get('/', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))
    res.send(gradesFile)
  } catch (err) {
    next(err)
  }
})

router.get('/totalGrade', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))

    const totalGrade = gradesFile.grades
      .filter(grade => {
        const { student, subject } = req.body
        return grade.student === student && grade.subject === subject
      })
      .reduce((acc, grade) => {
        return acc + grade.value
      }, 0)
      console.log(totalGrade);
      res.send(`${totalGrade}`)
  } catch (err) {
    next(err)
  }
})

router.get('/avgGrade', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))

    const filterGrades = gradesFile.grades.filter(grade => {
      const { subject, type } = req.body
      return grade.subject === subject && grade.type === type
    })

    const sumGrades = filterGrades.reduce((acc, grade) => {
      return acc + grade.value
    }, 0)

    const avgGrade = sumGrades/(filterGrades.length)
    res.send(`${avgGrade}`)
  } catch (err) {
    next(err)
  }
})

router.get('/topGrades', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))

    const filterGrades = gradesFile.grades.filter(grade => {
      const { subject, type } = req.body
      return grade.subject === subject && grade.type === type
    })

    const orderGrades = filterGrades.sort((a, b) => {
      return b.value - a.value
    })

    const topGrades = orderGrades.slice(0, 3)

    console.log(topGrades);
    res.send(topGrades)

  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))
    const grade = gradesFile.grades.find(grade => grade.id === parseInt(req.params.id))

    if (grade) {
      res.send(grade)
    } else {
      res.send(`ID ${req.params.id} not found`)
    }
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))
    const grade = {
      id: gradesFile.nextId++,
      student: req.body.student,
      subject: req.body.subject,
      type: req.body.type,
      value: req.body.value,
      timestamp: new Date().toLocaleString()
    }
    validate.post(grade)
    gradesFile.grades.push(grade)
    await fs.writeFile(global.gradesJSON, JSON.stringify(gradesFile, null, 2))
    res.send(grade)
  } catch (err) {
    next(err)
  }
})

router.put('/', async (req, res, next) => {
  try {
    const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))
    const grade = gradesFile.grades.find(grade => grade.id === parseInt(req.body.id))

    validate.put(grade, req.body)

    const { student, subject, type, value } = req.body
    grade.student = student
    grade.subject = subject
    grade.type = type
    grade.value = value
    grade.timestamp = new Date().toLocaleString()

    await fs.writeFile(global.gradesJSON, JSON.stringify(gradesFile, null, 2))
    res.send(grade)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  const gradesFile = JSON.parse(await fs.readFile(global.gradesJSON))
  const index = gradesFile.grades.findIndex(grade => grade.id === parseInt(req.params.id))

  if (index !== -1) {
    gradesFile.grades.splice(index, 1)
    await fs.writeFile(global.gradesJSON, JSON.stringify(gradesFile, null, 2))
    res.send(`Grade deleted - id:${req.params.id}`)
  } else {
    res.send(`ID ${req.params.id} not found`)
  }
})

router.use((err, req, res, next) => {
  console.log(err);
  res.status(400).send({ erro: err.message })
})

export default router