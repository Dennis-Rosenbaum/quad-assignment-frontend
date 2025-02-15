import dotenv from "dotenv"
import { NextResponse } from 'next/server'

dotenv.config()

export async function GET(req: Request) {
  const backendApi = process.env.BACKEND_API_KEY
  if (!backendApi) {
    throw new Error("BACKEND_API_KEY is not defined")
  }
  const url = new URL(req.url)
  const questionId = url.searchParams.get('questionId')
  const answerId = url.searchParams.get('answerId')
  try {
    const baseUrl = 'https://quad-assignment-gqbafbdwdpgnaxgy.westeurope-01.azurewebsites.net/api'
    const url = `${baseUrl}/questions/${questionId}/answers/${answerId}?apiKey=${process.env.BACKEND_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
