"use client"
import { Badge, Card, Grid, Stack } from "@mui/material"
import Image from "next/image"
import { useEffect, useState } from "react"

interface CurrentAnswer {
  answerId: string
  isValid: boolean
}

export default function Home() {

  const [question, setQuestion] = useState<Question | null>()
  const [answers, setAnswers] = useState<CurrentAnswer[]>([])
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState<boolean>(false)
  const [streak, setStreak] = useState<number>(0)

  const [errorSecondsToWait, setErrorSecondsToWait] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const baseUrl = 'https://quad-assignment-gqbafbdwdpgnaxgy.westeurope-01.azurewebsites.net/api'
  const fetchQuestion = async () => {

    const response = await fetch(`${baseUrl}/questions`)

    if(response.status === 424) {
      setErrorSecondsToWait(4)
      return
    }

    const json = await response.json()

    setError(null)
    const questions: Question[] = json
    setQuestion(questions[0])
  }

  useEffect(() => {
    if (errorSecondsToWait === 0)
    {
      fetchQuestion()
      return
    }  

    setError(`You have been rate limited, please wait a few seconds, we will try again in ${errorSecondsToWait} seconds`)
    setTimeout(() => {
      setErrorSecondsToWait(x => x - 1)
    }, 1000)
  }, [errorSecondsToWait])

  const verifyAnswer = (answerId: string) => {
    if (!question) return
    if (hasAnsweredCorrectly) return

    const url = `/api/verify-answer?questionId=${question.questionId}&answerId=${answerId}`
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const isValid = data.isValid
        if (isValid && answers.length == 0)
          setStreak(x => x + 1)
        else
          setStreak(0)

        setAnswers([...answers, { answerId, isValid: isValid }])
      })
  }

  useEffect(() => {
    if (!answers.some(x => x.isValid))
      return

    setHasAnsweredCorrectly(true)
    setTimeout(() => {
      setAnswers([])
      setHasAnsweredCorrectly(false)
      fetchQuestion()
    }, 3000)
  }, [answers])

  function decodeHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.documentElement.textContent
  }

  useEffect(() => {
    fetchQuestion()
  }, [])

  if (!question)
    return <div>
      Loading questions...
      <br />
      <br />
      {error}
    </div>

  return <>
    <Grid container spacing={2}>
      <Grid item md={3}>
        <Image
          src="/ninja.png"
          alt="Software ninja"
          width={200}
          height={200}
        />
      </Grid>
      <Grid item md={9}>
        <h1>Trivia madness</h1>
        <p>
          This is the first time ever that you encounter a trivia game that is impossible to hack!
          Don&#39;t even try to be a software ninja and look up the API calls in your Developer Toolbar Network tab and see if the answer is already there.
          You have to answer the questions purely by knowledge.
        </p>
      </Grid>

      <Grid item md={12}>
        <Card className="question bg-[#cfefff]" >
          {decodeHtml(question.question)}
        </Card>
      </Grid>
      {question.answers.map((answer, index) => {
        const isInvalid = answers.some(x => x.answerId === answer.id && !x.isValid)
        const isValid = answers.some(x => x.answerId === answer.id && x.isValid)
        let classNames = "answer"
        if (isInvalid)
          classNames += " incorrect"
        if (isValid)
          classNames += " correct"

        return (
          <Grid item md={6} key={`answer-${index}`} >
            <Card onClick={() => verifyAnswer(answer.id)} className={classNames}>
              <span className="text-2xl">
                {index + 1}.&nbsp;
              </span>{decodeHtml(answer.title)}
            </Card>
          </Grid>
        )
      })}

      <Grid item md={12}>
        <Stack direction="row" spacing={2} justifyContent='space-between'>
          <p>
            {hasAnsweredCorrectly && "Well done, another question will be loaded in a few seconds!"}
          </p>
          <Badge className="streak">
            <span className="">
              Streak:&nbsp;
            </span>{streak}
          </Badge>
        </Stack>
      </Grid>
    </Grid>
  </>
}
