import React, { useState, useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useParams, useNavigate, type NavigateFunction } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

interface TriviaQuestion {
  id: string;
  question?: string;
  options?: string[];
  answer?: string | null;
}

type Trivia = {
  id: number;
  questions: TriviaQuestion[];
}

type LoaderData = {
  trivia: Trivia;
};

const VALID_LEVELS = ['easy', 'medium', 'hard'];

export const loader: LoaderFunction = async ({ params, request }) => {
  const { level } = params;

  if (!level || !VALID_LEVELS.includes(level.toLowerCase())) {
    // Redirect to a default level or show an error page
    return redirect("/");
    // Alternatively, you could throw a response to show an error page:
    // throw new Response("Invalid trivia level", { status: 404 });
  }

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const response = await fetch(`${baseUrl}/api/trivia-questions/${level}`);

  const trivia = await response.json();
  return json({ trivia });
};

export default function TriviaQuestions() {
  const { trivia } = useLoaderData<LoaderData>();
  const triviaId = trivia?.id;
  const { level } = useParams();
  const navigate = useNavigate();

  const [questionNumber, setQuestionNumber] = useState(0);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [score, setScore] = useState(0);

  const currentQuestion = questions?.length > 0 ? questions[questionNumber] : {} as TriviaQuestion;

  const submitAnswer = async () => {
    const payload = {
      id: triviaId,
      questions
    }

    try {
      setSubmissionStatus('submitting');
      const response = await fetch('/api/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.message === "Answers submitted successfully") {
        setSubmissionStatus('success');
        setScore(data.score);
      } else {
        setSubmissionStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmissionStatus('error');
      alert("Error submitting answers. Please try again.");
    }
  }

  const handleNext = () => {
    if(questions.length - 1 > questionNumber) {
      setQuestionNumber((prev) => prev+1)
    } else {
      submitAnswer()
    }
  }

  const handleAnswer = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((question: TriviaQuestion) => {
        if(question.id === questionId) {
          if(question.answer === optionId) {
            return {...question, answer: null}
          }
          return {...question, answer: optionId}
        } else {
          return {...question}
        }
      })
    )
  }

  useEffect(() => {
    setQuestions(trivia.questions);
  }, [trivia.questions]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-2xl">
          {submissionStatus === 'submitting' && <Loading />}
          {submissionStatus === 'success' && <Score score={score} navigate={navigate} />}
          {submissionStatus === 'error' && <Error navigate={navigate} />}
          {questions?.length > 0 && submissionStatus === 'idle' && (
            <React.Fragment>
              <div className="bg-white rounded-md p-6 shadow-xl w-full mb-4">
                <div className="mb-4">
                  <span className="text-4xl">Level - {level?.toLocaleUpperCase()}</span>
                </div>
              </div>
              <div className="bg-white rounded-md pr-6 pl-6 py-6 shadow-xl w-full mb-4 flex justify-between items-center">
                <div>
                  <label>{questionNumber+1} of {questions.length} questions</label>
                </div>
                <div className="flex gap-2">
              
                  {questionNumber > 0 &&  <button className="border border-slate-300 rounded-md px-4 py-2" onClick={() => setQuestionNumber((prev) => prev-1)}>Back</button>}
                  <button className="place-self-end justify-self-end self border border-slate-300 rounded-md px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleNext()}>{questions.length - 1 > questionNumber ? 'Next' : 'Submit'}</button>
                </div>
              </div>
              {
                <div className="bg-white rounded-md pt-6 pr-6 pl-6 pb-2 shadow-xl w-full mb-4">
                  { 
                    (   
                    <React.Fragment>
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <p className="mb-4 text-slate-700">{currentQuestion?.question ?  currentQuestion?.question : '---'}</p>
                      </div>
                      <div className="pb-8">
                        {
                          currentQuestion?.options?.map((text) => (
                            <button key={text} className={`text-left border p-3 mb-2 w-full font-light rounded flex ${currentQuestion.answer === text ? 'bg-slate-200' : 'hover:bg-slate-100'}`} onClick={() => handleAnswer(currentQuestion?.id, text)}>{text}</button>
                          ))
                        }
                      </div>
                    </React.Fragment>
                    )
                  }
                </div>
              }
            </React.Fragment>
          )}
      </div>
    </div>
  </div>
  );
}

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className={`text-2xl font-bold`}>Please wait...</p>
    </div>
  )
}

const Score = ({ score, navigate }: { score: number, navigate: NavigateFunction }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className={`text-2xl font-bold ${score > 5 ? 'text-green-500' : 'text-red-500'}`}>Your score is {score}</p>
      <div className="flex gap-2">
        <button className="border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-100" onClick={() => navigate('/')}>Go back</button>
        <button className="border border-slate-300 rounded-md px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => window.location.reload()}>Play again</button>
      </div>
    </div>
  )
}

const Error = ({ navigate }: { navigate: NavigateFunction }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-2xl font-bold text-red-500 text-center">Something went wrong. Please try again later.</p>
        <div className="flex gap-2">
        <button className="border border-slate-300 rounded-md px-4 py-2 hover:bg-slate-100" onClick={() => navigate('/')}>Go back to home</button>
      </div>
    </div>
  )
}